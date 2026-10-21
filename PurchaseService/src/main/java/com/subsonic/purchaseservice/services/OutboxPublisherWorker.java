package com.subsonic.purchaseservice.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.subsonic.purchaseservice.config.RabbitMQConfig;
import com.subsonic.purchaseservice.dao.OutboxDao;
import com.subsonic.purchaseservice.models.OutboxEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OutboxPublisherWorker {
    private static final Logger log = LoggerFactory.getLogger(OutboxPublisherWorker.class);

    private final OutboxDao outboxDao;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public OutboxPublisherWorker(OutboxDao outboxDao, RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.outboxDao = outboxDao;
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Despacho de Outbox: Despierta periódicamente, lee eventos pendientes y los envía a RabbitMQ.
     */
    @Scheduled(fixedDelayString = "${outbox.worker.interval:30000}", initialDelay = 5000)
    public void processOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxDao.findUnpublished(50);
        if (pendingEvents.isEmpty()) {
            return;
        }

        log.info("Procesando {} eventos pendientes de outbox hacia RabbitMQ...", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            try {
                publicarEvento(event);
                outboxDao.markAsPublished(event.getId());
                log.info("Evento outbox {} publicado exitosamente en RabbitMQ y marcado como published=true", event.getId());
            } catch (Exception e) {
                log.warn("Fallo temporal al publicar evento {} en RabbitMQ (se reintentará en el siguiente ciclo): {}",
                        event.getId(), e.getMessage());
                break; // Detener el lote para no saturar si RabbitMQ está temporalmente caído
            }
        }
    }

    private void publicarEvento(OutboxEvent event) throws Exception {
        JsonNode root = objectMapper.readTree(event.getPayload());
        boolean hasTickets = root.has("tickets") && root.get("tickets").isArray() && !root.get("tickets").isEmpty();
        boolean hasMerch = root.has("merchandise") && root.get("merchandise").isArray() && !root.get("merchandise").isEmpty();

        // Enrutar a Cola de Pedidos (ticket_queue) si incluye entradas
        if (hasTickets) {
            log.info("Enrutando evento {} a ticket_queue (routingKey: {})", event.getId(), RabbitMQConfig.ROUTING_KEY_TICKET);
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.ROUTING_KEY_TICKET,
                    event.getPayload()
            );
        }

        // Enrutar a Cola de Inventario (merch_queue) si incluye merchandising
        if (hasMerch) {
            log.info("Enrutando evento {} a merch_queue (routingKey: {})", event.getId(), RabbitMQConfig.ROUTING_KEY_MERCH);
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    RabbitMQConfig.ROUTING_KEY_MERCH,
                    event.getPayload()
            );
        }

        // Si no discrimina tickets ni merch, enviar al exchange por defecto
        if (!hasTickets && !hasMerch) {
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.EXCHANGE_NAME,
                    "order.general",
                    event.getPayload()
            );
        }
    }
}

