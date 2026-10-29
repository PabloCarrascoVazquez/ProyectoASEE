package routes

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"orderservice/app/dtos"
	"orderservice/app/middleware"
	"orderservice/app/services"
)

type OrderRoutes struct {
	orderService *services.OrderService
	qrService    *services.QRService
	auth         *middleware.AuthMiddleware
	staffRoles   []string
}

func NewOrderRoutes(
	orderService *services.OrderService,
	qrService *services.QRService,
	auth *middleware.AuthMiddleware,
	staffRoles []string,
) *OrderRoutes {
	return &OrderRoutes{
		orderService: orderService,
		qrService:    qrService,
		auth:         auth,
		staffRoles:   staffRoles,
	}
}

// RegisterRoutes registra los endpoints del servicio en el ServeMux HTTP estándar de Go.
func (h *OrderRoutes) RegisterRoutes(mux *http.ServeMux) {
	// 1. Ver mis entradas adquiridas (Billetera / Wallet)
	mux.HandleFunc("GET /api/pedidos/mis-entradas", h.auth.TokenRequired(h.handleMisEntradas))

	// 2. Obtener el token criptográfico para renderizar el QR
	mux.HandleFunc("GET /api/pedidos/mis-entradas/{id_entrada}/qr", h.auth.TokenRequired(h.handleGenerarQR))

	// 3. Validar un QR escaneado (Uso exclusivo por staff en la puerta)
	mux.HandleFunc("POST /api/acceso/validar-qr", h.auth.RoleRequired(h.staffRoles, h.handleValidarQR))

	// 4. Solicitar cancelación / devolución de una entrada
	mux.HandleFunc("POST /api/pedidos/{id_entrada}/cancelaciones", h.auth.TokenRequired(h.handleSolicitarCancelacion))
}

// GET /api/pedidos/mis-entradas
func (h *OrderRoutes) handleMisEntradas(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetCurrentUserID(r)
	entradas, err := h.orderService.ListarMisEntradas(userID)
	if err != nil {
		h.respondJSON(w, http.StatusInternalServerError, dtos.ErrorResponse{
			Codigo:  500,
			Mensaje: "Error interno del servidor",
			Detalle: err.Error(),
		})
		return
	}

	h.respondJSON(w, http.StatusOK, entradas)
}

// GET /api/pedidos/mis-entradas/{id_entrada}/qr
func (h *OrderRoutes) handleGenerarQR(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetCurrentUserID(r)
	idEntrada := extractPathParam(r, "id_entrada", "/api/pedidos/mis-entradas/", "/qr")
	if idEntrada == "" {
		h.respondJSON(w, http.StatusBadRequest, dtos.ErrorResponse{
			Codigo:  400,
			Mensaje: "Petición incorrecta",
			Detalle: "El parámetro id_entrada es requerido en la ruta.",
		})
		return
	}

	res, err := h.qrService.GenerarTokenQR(userID, idEntrada)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrEntradaNoEncontrada), errors.Is(err, services.ErrEntradaNoAutorizada):
			h.respondJSON(w, http.StatusNotFound, dtos.ErrorResponse{
				Codigo:  404,
				Mensaje: "Recurso no encontrado",
				Detalle: "El recurso solicitado (entrada) no existe o no pertenece al usuario.",
			})
		case errors.Is(err, services.ErrQREntradaYaUsada):
			h.respondJSON(w, http.StatusBadRequest, dtos.ErrorResponse{
				Codigo:  400,
				Mensaje: "Entrada ya utilizada",
				Detalle: "Esta entrada ya ha sido escaneada y validada en puerta previamente.",
			})
		case errors.Is(err, services.ErrQREntradaCancelada):
			h.respondJSON(w, http.StatusBadRequest, dtos.ErrorResponse{
				Codigo:  400,
				Mensaje: "Entrada cancelada",
				Detalle: "Esta entrada ha sido cancelada o se encuentra en proceso de devolución.",
			})
		default:
			h.respondJSON(w, http.StatusInternalServerError, dtos.ErrorResponse{
				Codigo:  500,
				Mensaje: "Error interno del servidor",
				Detalle: err.Error(),
			})
		}
		return
	}

	h.respondJSON(w, http.StatusOK, res)
}

// POST /api/acceso/validar-qr
func (h *OrderRoutes) handleValidarQR(w http.ResponseWriter, r *http.Request) {
	var req dtos.ValidacionQRRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.TokenQR) == "" {
		h.respondJSON(w, http.StatusBadRequest, dtos.ErrorResponse{
			Codigo:  400,
			Mensaje: "Petición incorrecta",
			Detalle: "El cuerpo de la petición debe incluir un 'token_qr' válido.",
		})
		return
	}

	res, err := h.qrService.ValidarAccesoQR(req.TokenQR)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrQRInvalidoOExpirado):
			h.respondJSON(w, http.StatusForbidden, dtos.ErrorResponse{
				Codigo:  403,
				Mensaje: "Acceso denegado",
				Detalle: "El código QR es inválido o ha caducado.",
			})
		case errors.Is(err, services.ErrQREntradaYaUsada):
			h.respondJSON(w, http.StatusForbidden, dtos.ErrorResponse{
				Codigo:  403,
				Mensaje: "Acceso denegado",
				Detalle: "Esta entrada ya ha sido escaneada previamente en puerta.",
			})
		case errors.Is(err, services.ErrQREntradaCancelada):
			h.respondJSON(w, http.StatusForbidden, dtos.ErrorResponse{
				Codigo:  403,
				Mensaje: "Acceso denegado",
				Detalle: "La entrada asociada a este QR ha sido cancelada.",
			})
		default:
			h.respondJSON(w, http.StatusInternalServerError, dtos.ErrorResponse{
				Codigo:  500,
				Mensaje: "Error interno del servidor",
				Detalle: err.Error(),
			})
		}
		return
	}

	h.respondJSON(w, http.StatusOK, res)
}

// POST /api/pedidos/{id_entrada}/cancelaciones
func (h *OrderRoutes) handleSolicitarCancelacion(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetCurrentUserID(r)
	idEntrada := extractPathParam(r, "id_entrada", "/api/pedidos/", "/cancelaciones")
	if idEntrada == "" {
		h.respondJSON(w, http.StatusBadRequest, dtos.ErrorResponse{
			Codigo:  400,
			Mensaje: "Petición incorrecta",
			Detalle: "El parámetro id_entrada es requerido.",
		})
		return
	}

	res, err := h.orderService.SolicitarCancelacion(userID, idEntrada)
	if err != nil {
		switch {
		case errors.Is(err, services.ErrEntradaNoEncontrada), errors.Is(err, services.ErrEntradaNoAutorizada):
			h.respondJSON(w, http.StatusNotFound, dtos.ErrorResponse{
				Codigo:  404,
				Mensaje: "Recurso no encontrado",
				Detalle: "La entrada especificada no existe o no pertenece al usuario.",
			})
		case errors.Is(err, services.ErrEntradaYaCancelada):
			h.respondJSON(w, http.StatusBadRequest, dtos.ErrorResponse{
				Codigo:  400,
				Mensaje: "Petición incorrecta",
				Detalle: "La entrada ya se encuentra cancelada o en proceso de devolución.",
			})
		case errors.Is(err, services.ErrEntradaYaUsada):
			h.respondJSON(w, http.StatusBadRequest, dtos.ErrorResponse{
				Codigo:  400,
				Mensaje: "Petición incorrecta",
				Detalle: "No se puede cancelar una entrada que ya ha sido usada en el festival.",
			})
		default:
			h.respondJSON(w, http.StatusBadRequest, dtos.ErrorResponse{
				Codigo:  400,
				Mensaje: "Petición incorrecta",
				Detalle: err.Error(),
			})
		}
		return
	}

	h.respondJSON(w, http.StatusCreated, res)
}

func (h *OrderRoutes) respondJSON(w http.ResponseWriter, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(payload)
}

// extractPathParam utiliza Go 1.22 r.PathValue con fallback para versiones previas o proxies
func extractPathParam(r *http.Request, name, prefix, suffix string) string {
	if val := r.PathValue(name); val != "" {
		return val
	}
	path := r.URL.Path
	if prefix != "" && strings.Contains(path, prefix) {
		trimmed := strings.Split(path, prefix)
		if len(trimmed) > 1 {
			val := trimmed[1]
			if suffix != "" && strings.Contains(val, suffix) {
				val = strings.Split(val, suffix)[0]
			}
			return strings.Trim(val, "/")
		}
	}
	return ""
}
