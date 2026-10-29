package daos

import (
	"orderservice/app/models"
	"time"
)

// IEntradaDAO define el contrato de persistencia para las entradas del Wallet.
type IEntradaDAO interface {
	// Create inserta una nueva entrada individual
	Create(entrada *models.Entrada) error

	// CreateBatch inserta un conjunto de entradas en una transacción
	CreateBatch(entradas []*models.Entrada) error

	// GetByID obtiene una entrada por su identificador UUID
	GetByID(idEntrada string) (*models.Entrada, error)

	// GetByUserID obtiene todas las entradas pertenecientes a un usuario
	GetByUserID(userID string) ([]*models.Entrada, error)

	// ExistsByTransactionID verifica si las entradas de una transacción ya fueron generadas (idempotencia)
	ExistsByTransactionID(transaccionID string) (bool, error)

	// MarcarComoUsada realiza una actualización atómica: solo pasa a 'Usada' si el estado actual es 'Valida'
	// Retorna true si se actualizó, false si no estaba en estado 'Valida' o no existe.
	MarcarComoUsada(idEntrada string, fechaUso time.Time) (bool, error)

	// ActualizarEstado modifica el estado de la entrada (por ejemplo, a 'Cancelada')
	ActualizarEstado(idEntrada string, nuevoEstado models.EstadoEntrada) (bool, error)
}

// ICancelacionDAO define el contrato de persistencia para el registro de cancelaciones.
type ICancelacionDAO interface {
	// Create registra una nueva solicitud de cancelación
	Create(cancelacion *models.Cancelacion) error

	// GetByEntradaID obtiene el registro de cancelación de una entrada
	GetByEntradaID(idEntrada string) (*models.Cancelacion, error)

	// GetByUserID lista las cancelaciones de un usuario
	GetByUserID(userID string) ([]*models.Cancelacion, error)
}
