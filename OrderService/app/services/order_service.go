package services

import (
	"errors"
	"fmt"
	"log"
	"time"

	"orderservice/app/daos"
	"orderservice/app/dtos"
	"orderservice/app/models"

	"github.com/google/uuid"
)

// Errores de dominio
var (
	ErrEntradaNoEncontrada   = errors.New("ENTRADA_NOT_FOUND")
	ErrEntradaNoAutorizada   = errors.New("ENTRADA_FORBIDDEN")
	ErrEntradaNoCancelable   = errors.New("ENTRADA_NO_CANCELABLE")
	ErrEntradaYaCancelada    = errors.New("ENTRADA_ALREADY_CANCELLED")
	ErrEntradaYaUsada        = errors.New("ENTRADA_ALREADY_USED")
)

type OrderService struct {
	entradaDAO     daos.IEntradaDAO
	cancelacionDAO daos.ICancelacionDAO
}

func NewOrderService(entradaDAO daos.IEntradaDAO, cancelacionDAO daos.ICancelacionDAO) *OrderService {
	return &OrderService{
		entradaDAO:     entradaDAO,
		cancelacionDAO: cancelacionDAO,
	}
}

// ListarMisEntradas devuelve las entradas digitales pertenecientes al usuario autenticado.
func (s *OrderService) ListarMisEntradas(userID string) ([]dtos.EntradaResponse, error) {
	entradas, err := s.entradaDAO.GetByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("error al obtener entradas: %w", err)
	}

	res := make([]dtos.EntradaResponse, 0, len(entradas))
	for _, e := range entradas {
		res = append(res, dtos.EntradaResponse{
			IDEntrada:   e.IDEntrada,
			IDFestival:  e.IDFestival,
			Tipo:        string(e.Tipo),
			FechaCompra: e.FechaCompra.Format(time.RFC3339),
			Estado:      string(e.Estado),
		})
	}
	return res, nil
}

// ObtenerEntradaUsuario obtiene una entrada específica asegurando que pertenezca al usuario.
func (s *OrderService) ObtenerEntradaUsuario(userID, idEntrada string) (*models.Entrada, error) {
	entrada, err := s.entradaDAO.GetByID(idEntrada)
	if err != nil {
		return nil, err
	}
	if entrada == nil {
		return nil, ErrEntradaNoEncontrada
	}
	if entrada.UserID != userID {
		return nil, ErrEntradaNoAutorizada
	}
	return entrada, nil
}

// SolicitarCancelacion tramita la cancelación y solicitud de devolución de una entrada.
// Diseñado modularmente: marca el estado localmente y deja preparado el hook para notificación externa.
func (s *OrderService) SolicitarCancelacion(userID, idEntrada string) (*dtos.CancelacionResponse, error) {
	entrada, err := s.ObtenerEntradaUsuario(userID, idEntrada)
	if err != nil {
		return nil, err
	}

	if entrada.Estado == models.EstadoCancelada {
		return nil, ErrEntradaYaCancelada
	}
	if entrada.Estado == models.EstadoUsada {
		return nil, ErrEntradaYaUsada
	}
	if entrada.Estado != models.EstadoValida {
		return nil, ErrEntradaNoCancelable
	}

	// 1. Actualizar estado de la entrada a Cancelada
	actualizado, err := s.entradaDAO.ActualizarEstado(idEntrada, models.EstadoCancelada)
	if err != nil {
		return nil, fmt.Errorf("error al cancelar entrada: %w", err)
	}
	if !actualizado {
		return nil, ErrEntradaNoCancelable
	}

	// 2. Registrar la solicitud de cancelación
	now := time.Now().UTC()
	cancelacion := &models.Cancelacion{
		IDCancelacion:    uuid.New().String(),
		IDEntrada:        idEntrada,
		UserID:           userID,
		EstadoDevolucion: "En proceso",
		FechaSolicitud:   now,
		Motivo:           "Solicitud voluntaria del usuario",
	}

	if err := s.cancelacionDAO.Create(cancelacion); err != nil {
		return nil, fmt.Errorf("error al guardar cancelacion: %w", err)
	}

	// 3. Hook para notificación remota/asíncrona (cuando se decida la política con otros servicios)
	s.despacharNotificacionCancelacion(cancelacion, entrada)

	return &dtos.CancelacionResponse{
		IDEntrada:        idEntrada,
		EstadoDevolucion: cancelacion.EstadoDevolucion,
		FechaSolicitud:   cancelacion.FechaSolicitud.Format(time.RFC3339),
	}, nil
}

// despacharNotificacionCancelacion es el punto de extensión para notificar a CatalogService/PurchaseService
func (s *OrderService) despacharNotificacionCancelacion(c *models.Cancelacion, e *models.Entrada) {
	// Hook modular: preparado para emitir evento o llamada HTTP cuando el usuario tome la decisión
	log.Printf("[Cancelaciones] Solicitud registrada para entrada %s (usuario %s, festival %s). Estado: %s",
		c.IDEntrada, c.UserID, e.IDFestival, c.EstadoDevolucion)
}
