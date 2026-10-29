package dtos

// ValidacionQRRequest representa el cuerpo de la petición POST /acceso/validar-qr
// enviada desde los escáneres en las puertas del festival.
type ValidacionQRRequest struct {
	TokenQR string `json:"token_qr"`
}

// PurchaseEventTicketItem mapea los items de tickets que PurchaseService publica en RabbitMQ
type PurchaseEventTicketItem struct {
	ItemID     string  `json:"item_id"`
	FestivalID string  `json:"festival_id"`
	Quantity   int     `json:"quantity"`
	UnitPrice  float64 `json:"unit_price"`
	Subtotal   float64 `json:"subtotal"`
	TicketType string  `json:"ticket_type"`
}

// PurchaseEventPayload representa el evento recibido de la cola ticket_queue
type PurchaseEventPayload struct {
	TransactionID        string                    `json:"transaction_id"`
	UserID               string                    `json:"user_id"`
	TotalAmount          float64                   `json:"total_amount"`
	Currency             string                    `json:"currency"`
	PaymentMethod        string                    `json:"payment_method"`
	GatewayTransactionID string                    `json:"gateway_transaction_id"`
	ReceiptURL           string                    `json:"receipt_url"`
	Timestamp            string                    `json:"timestamp"`
	Tickets              []PurchaseEventTicketItem `json:"tickets"`
}
