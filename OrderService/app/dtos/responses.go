package dtos

// EntradaResponse representa el schema Entrada de api-pedidos.yaml
type EntradaResponse struct {
	IDEntrada   string `json:"id_entrada"`
	IDFestival  string `json:"id_festival"`
	Tipo        string `json:"tipo"`
	FechaCompra string `json:"fecha_compra"`
	Estado      string `json:"estado"`
}

// TokenQRResponse representa el schema TokenQR de api-pedidos.yaml
type TokenQRResponse struct {
	TokenQR         string `json:"token_qr"`
	FechaExpiracion string `json:"fecha_expiracion"`
}

// ValidacionQRResponse representa el schema ValidacionQRResponse de api-pedidos.yaml
type ValidacionQRResponse struct {
	EstadoAcceso bool   `json:"estado_acceso"`
	Mensaje      string `json:"mensaje"`
}

// CancelacionResponse representa el schema CancelacionResponse de api-pedidos.yaml
type CancelacionResponse struct {
	IDEntrada        string `json:"id_entrada"`
	EstadoDevolucion string `json:"estado_devolucion"`
	FechaSolicitud   string `json:"fecha_solicitud"`
}

// ErrorResponse representa el schema Error de api-pedidos.yaml
type ErrorResponse struct {
	Codigo  int    `json:"codigo"`
	Mensaje string `json:"mensaje"`
	Detalle string `json:"detalle"`
}
