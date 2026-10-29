package models

import "time"

// EstadoEntrada define los estados posibles de una entrada según api-pedidos.yaml
type EstadoEntrada string

const (
	EstadoValida    EstadoEntrada = "Valida"
	EstadoUsada     EstadoEntrada = "Usada"
	EstadoCancelada EstadoEntrada = "Cancelada"
)

// TipoEntrada define las categorías soportadas según api-pedidos.yaml
type TipoEntrada string

const (
	TipoGeneral TipoEntrada = "General"
	TipoVIP     TipoEntrada = "VIP"
	TipoAbono   TipoEntrada = "Abono"
)

// NormalizarTipo convierte las cadenas recibidas de PurchaseService ("day", "weekend", "vip")
// al formato oficial exigido en api-pedidos.yaml ("General", "Abono", "VIP").
func NormalizarTipo(raw string) TipoEntrada {
	switch raw {
	case "vip", "VIP":
		return TipoVIP
	case "weekend", "abono", "Abono":
		return TipoAbono
	case "day", "general", "General":
		return TipoGeneral
	default:
		return TipoGeneral
	}
}

// Entrada representa el modelo de dominio de una entrada digital custodiada en el wallet.
type Entrada struct {
	IDEntrada     string        `json:"id_entrada"`
	IDFestival    string        `json:"id_festival"`
	UserID        string        `json:"user_id"`
	Tipo          TipoEntrada   `json:"tipo"`
	FechaCompra   time.Time     `json:"fecha_compra"`
	Estado        EstadoEntrada `json:"estado"`
	TransaccionID string        `json:"transaccion_id,omitempty"`
	FechaUso      *time.Time    `json:"fecha_uso,omitempty"`
}
