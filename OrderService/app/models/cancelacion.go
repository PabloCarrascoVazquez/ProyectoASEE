package models

import "time"

// Cancelacion representa el registro de una solicitud de devolución o cancelación de una entrada.
type Cancelacion struct {
	IDCancelacion    string    `json:"id_cancelacion"`
	IDEntrada        string    `json:"id_entrada"`
	UserID           string    `json:"user_id"`
	EstadoDevolucion string    `json:"estado_devolucion"` // "En proceso", "Completada", etc.
	FechaSolicitud   time.Time `json:"fecha_solicitud"`
	Motivo           string    `json:"motivo,omitempty"`
}
