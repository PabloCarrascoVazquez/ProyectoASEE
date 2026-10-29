package services

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"orderservice/app/core"
	"orderservice/app/daos"
	"orderservice/app/dtos"
	"orderservice/app/models"

	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	ExchangeName     = "subsonic.purchases.exchange"
	TicketQueueName  = "ticket_queue"
	RoutingKeyTicket = "order.ticket"
)

// TicketConsumer escucha la cola de RabbitMQ 'ticket_queue' donde PurchaseService
// publica eventos ORDER_PAID cuando una compra incluye entradas.
type TicketConsumer struct {
	entradaDAO daos.IEntradaDAO
	settings   *core.Settings
}

func NewTicketConsumer(entradaDAO daos.IEntradaDAO, settings *core.Settings) *TicketConsumer {
	return &TicketConsumer{
		entradaDAO: entradaDAO,
		settings:   settings,
	}
}

// Start arranca el bucle del consumidor en segundo plano con reconexión automática.
func (c *TicketConsumer) Start(ctx context.Context) {
	if !c.settings.RabbitMQEnabled {
		log.Println("[TicketConsumer] RabbitMQ está desactivado por configuración (RABBITMQ_ENABLED=false).")
		return
	}

	go func() {
		for {
			select {
			case <-ctx.Done():
				log.Println("[TicketConsumer] Deteniendo consumidor de RabbitMQ.")
				return
			default:
				err := c.connectAndConsume(ctx)
				if err != nil {
					log.Printf("[TicketConsumer] Conexión RabbitMQ no disponible (%v). Reintentando en %d segundos...",
						err, c.settings.RabbitMQReconnectSeconds)
				}
				select {
				case <-ctx.Done():
					return
				case <-time.After(time.Duration(c.settings.RabbitMQReconnectSeconds) * time.Second):
				}
			}
		}
	}()
}

func (c *TicketConsumer) connectAndConsume(ctx context.Context) error {
	amqpURI := fmt.Sprintf("amqp://%s:%s@%s:%d/",
		c.settings.RabbitMQUsername,
		c.settings.RabbitMQPassword,
		c.settings.RabbitMQHost,
		c.settings.RabbitMQPort,
	)

	conn, err := amqp.Dial(amqpURI)
	if err != nil {
		return err
	}
	defer conn.Close()

	ch, err := conn.Channel()
	if err != nil {
		return err
	}
	defer ch.Close()

	// Asegurar existencia del Exchange y de la Cola
	if err := ch.ExchangeDeclare(
		ExchangeName,
		"topic",
		true,  // durable
		false, // auto-deleted
		false, // internal
		false, // no-wait
		nil,
	); err != nil {
		return fmt.Errorf("error al declarar exchange: %w", err)
	}

	q, err := ch.QueueDeclare(
		TicketQueueName,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,
	)
	if err != nil {
		return fmt.Errorf("error al declarar cola: %w", err)
	}

	if err := ch.QueueBind(
		q.Name,
		RoutingKeyTicket,
		ExchangeName,
		false,
		nil,
	); err != nil {
		return fmt.Errorf("error al vincular cola con exchange: %w", err)
	}

	msgs, err := ch.Consume(
		q.Name,
		"orderservice-ticket-consumer",
		false, // autoAck = false para confirmar tras procesar
		false, // exclusive
		false, // noLocal
		false, // noWait
		nil,
	)
	if err != nil {
		return fmt.Errorf("error al iniciar consumo: %w", err)
	}

	log.Printf("[TicketConsumer] Escuchando mensajes en cola '%s' vinculada a '%s'...", q.Name, RoutingKeyTicket)

	for {
		select {
		case <-ctx.Done():
			return nil
		case msg, ok := <-msgs:
			if !ok {
				return fmt.Errorf("canal de mensajes cerrado")
			}
			if err := c.procesarMensaje(msg.Body); err != nil {
				log.Printf("[TicketConsumer] Error procesando evento de entrada: %v", err)
				// Nack sin requeue en caso de payload malformado para evitar bucle infinito
				_ = msg.Nack(false, false)
			} else {
				_ = msg.Ack(false)
			}
		}
	}
}

// ProcesarMensaje parsea el evento y genera las entradas digitales con garantía de idempotencia.
func (c *TicketConsumer) procesarMensaje(body []byte) error {
	var payload dtos.PurchaseEventPayload
	if err := json.Unmarshal(body, &payload); err != nil {
		return fmt.Errorf("json inválido en evento outbox: %w", err)
	}

	if payload.TransactionID == "" || payload.UserID == "" {
		log.Println("[TicketConsumer] Evento ignorado: falta transaction_id o user_id.")
		return nil
	}

	if len(payload.Tickets) == 0 {
		log.Printf("[TicketConsumer] Evento %s no contiene tickets. Omitiendo.", payload.TransactionID)
		return nil
	}

	// Control de Idempotencia: si ya generamos entradas para esta transacción, no duplicamos
	yaProcesada, err := c.entradaDAO.ExistsByTransactionID(payload.TransactionID)
	if err != nil {
		return fmt.Errorf("error verificando idempotencia de transacción %s: %w", payload.TransactionID, err)
	}
	if yaProcesada {
		log.Printf("[TicketConsumer] Transacción %s ya fue procesada anteriormente. Descartando duplicado.", payload.TransactionID)
		return nil
	}

	fechaCompra := time.Now().UTC()
	if payload.Timestamp != "" {
		if t, err := time.Parse(time.RFC3339, payload.Timestamp); err == nil {
			fechaCompra = t
		}
	}

	var nuevasEntradas []*models.Entrada
	for _, item := range payload.Tickets {
		cant := item.Quantity
		if cant <= 0 {
			cant = 1
		}
		festivalID := item.FestivalID
		if festivalID == "" {
			festivalID = item.ItemID
		}
		tipo := models.NormalizarTipo(item.TicketType)

		for i := 0; i < cant; i++ {
			nuevasEntradas = append(nuevasEntradas, &models.Entrada{
				IDEntrada:     uuid.New().String(),
				IDFestival:    festivalID,
				UserID:        payload.UserID,
				Tipo:          tipo,
				FechaCompra:   fechaCompra,
				Estado:        models.EstadoValida,
				TransaccionID: payload.TransactionID,
			})
		}
	}

	if err := c.entradaDAO.CreateBatch(nuevasEntradas); err != nil {
		return fmt.Errorf("error al guardar entradas en base de datos: %w", err)
	}

	log.Printf("[TicketConsumer] Se han generado exitosamente %d entrada(s) para usuario %s (transacción %s)",
		len(nuevasEntradas), payload.UserID, payload.TransactionID)
	return nil
}
