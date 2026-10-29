package services

import (
	"errors"
	"fmt"
	"time"

	"orderservice/app/core"
	"orderservice/app/daos"
	"orderservice/app/dtos"
	"orderservice/app/models"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrQRInvalidoOExpirado = errors.New("QR_INVALID_OR_EXPIRED")
	ErrQREntradaNoValida   = errors.New("QR_TICKET_NOT_VALID")
	ErrQREntradaYaUsada    = errors.New("QR_TICKET_ALREADY_USED")
	ErrQREntradaCancelada  = errors.New("QR_TICKET_CANCELLED")
)

type QRService struct {
	entradaDAO daos.IEntradaDAO
	settings   *core.Settings
}

func NewQRService(entradaDAO daos.IEntradaDAO, settings *core.Settings) *QRService {
	return &QRService{
		entradaDAO: entradaDAO,
		settings:   settings,
	}
}

// QRClaims contiene los datos cifrados/firmados dentro del código QR escaneable en puerta
type QRClaims struct {
	IDEntrada  string `json:"id_entrada"`
	UserID     string `json:"user_id"`
	IDFestival string `json:"id_festival"`
	Tipo       string `json:"tipo"`
	Type       string `json:"type"` // "subsonic_qr"
	jwt.RegisteredClaims
}

// GenerarTokenQR genera el token criptográfico firmado para renderizar el QR en la wallet.
func (s *QRService) GenerarTokenQR(userID, idEntrada string) (*dtos.TokenQRResponse, error) {
	entrada, err := s.entradaDAO.GetByID(idEntrada)
	if err != nil {
		return nil, fmt.Errorf("error al verificar entrada: %w", err)
	}
	if entrada == nil {
		return nil, ErrEntradaNoEncontrada
	}
	if entrada.UserID != userID {
		return nil, ErrEntradaNoAutorizada
	}

	if entrada.Estado == models.EstadoUsada {
		return nil, ErrQREntradaYaUsada
	}
	if entrada.Estado == models.EstadoCancelada {
		return nil, ErrQREntradaCancelada
	}
	if entrada.Estado != models.EstadoValida {
		return nil, ErrQREntradaNoValida
	}

	expTime := time.Now().UTC().Add(time.Duration(s.settings.QRTokenExpireMinutes) * time.Minute)
	claims := QRClaims{
		IDEntrada:  entrada.IDEntrada,
		UserID:     entrada.UserID,
		IDFestival: entrada.IDFestival,
		Tipo:       string(entrada.Tipo),
		Type:       "subsonic_qr",
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   entrada.IDEntrada,
			IssuedAt:  jwt.NewNumericDate(time.Now().UTC()),
			ExpiresAt: jwt.NewNumericDate(expTime),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.settings.QRSecretKey))
	if err != nil {
		return nil, fmt.Errorf("error al firmar token QR: %w", err)
	}

	return &dtos.TokenQRResponse{
		TokenQR:         tokenString,
		FechaExpiracion: expTime.Format(time.RFC3339),
	}, nil
}

// ValidarAccesoQR valida el token escaneado por el personal de acceso en las puertas.
func (s *QRService) ValidarAccesoQR(tokenQR string) (*dtos.ValidacionQRResponse, error) {
	if tokenQR == "" {
		return nil, ErrQRInvalidoOExpirado
	}

	token, err := jwt.ParseWithClaims(tokenQR, &QRClaims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("método de firma no soportado: %v", t.Header["alg"])
		}
		return []byte(s.settings.QRSecretKey), nil
	})

	if err != nil || !token.Valid {
		return nil, ErrQRInvalidoOExpirado
	}

	claims, ok := token.Claims.(*QRClaims)
	if !ok || claims.IDEntrada == "" {
		return nil, ErrQRInvalidoOExpirado
	}

	// 1. Intento de actualización atómica: solo pasa de Valida a Usada
	now := time.Now().UTC()
	marcada, err := s.entradaDAO.MarcarComoUsada(claims.IDEntrada, now)
	if err != nil {
		return nil, fmt.Errorf("error al validar acceso: %w", err)
	}

	if !marcada {
		// La entrada ya no estaba 'Valida'. Consultamos para dar el motivo exacto de denegación (403)
		entrada, errConsulta := s.entradaDAO.GetByID(claims.IDEntrada)
		if errConsulta != nil || entrada == nil {
			return nil, ErrQRInvalidoOExpirado
		}
		if entrada.Estado == models.EstadoUsada {
			return nil, ErrQREntradaYaUsada
		}
		if entrada.Estado == models.EstadoCancelada {
			return nil, ErrQREntradaCancelada
		}
		return nil, ErrQREntradaNoValida
	}

	return &dtos.ValidacionQRResponse{
		EstadoAcceso: true,
		Mensaje:      "Acceso permitido. Entrada actualizada a 'Usada'.",
	}, nil
}
