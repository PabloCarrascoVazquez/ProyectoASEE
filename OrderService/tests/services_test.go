package tests

import (
	"errors"
	"testing"
	"time"

	"orderservice/app/core"
	"orderservice/app/daos/sqlite_impl"
	"orderservice/app/models"
	"orderservice/app/services"

	"github.com/google/uuid"
)

func TestOrderService_FlujoWalletYCancelacion(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	entradaDAO := sqliteimpl.NewEntradaDAOSQLite(db)
	cancelacionDAO := sqliteimpl.NewCancelacionDAOSQLite(db)
	service := services.NewOrderService(entradaDAO, cancelacionDAO)

	userID := "usr-wallet-1"
	entradaID := uuid.New().String()

	// 1. Insertar entrada válida
	_ = entradaDAO.Create(&models.Entrada{
		IDEntrada:     entradaID,
		IDFestival:    "fest_2026",
		UserID:        userID,
		Tipo:          models.TipoGeneral,
		FechaCompra:   time.Now().UTC(),
		Estado:        models.EstadoValida,
		TransaccionID: "tx-test-1",
	})

	// 2. Listar wallet
	entradas, err := service.ListarMisEntradas(userID)
	if err != nil || len(entradas) != 1 {
		t.Fatalf("Error listando wallet del usuario: %v", err)
	}
	if entradas[0].IDEntrada != entradaID || entradas[0].Estado != "Valida" {
		t.Errorf("Entrada en wallet inesperada: %+v", entradas[0])
	}

	// 3. Solicitar cancelación con otro usuario (debe dar 404/Forbidden)
	_, errOtro := service.SolicitarCancelacion("otro-usuario", entradaID)
	if !errors.Is(errOtro, services.ErrEntradaNoAutorizada) {
		t.Errorf("Se esperaba ErrEntradaNoAutorizada, recibido: %v", errOtro)
	}

	// 4. Solicitar cancelación legítima
	resCancelacion, err := service.SolicitarCancelacion(userID, entradaID)
	if err != nil {
		t.Fatalf("Fallo en solicitud de cancelación: %v", err)
	}
	if resCancelacion.EstadoDevolucion != "En proceso" || resCancelacion.IDEntrada != entradaID {
		t.Errorf("Respuesta de cancelación inesperada: %+v", resCancelacion)
	}

	// 5. Segunda cancelación debe fallar con ErrEntradaYaCancelada
	_, errSegunda := service.SolicitarCancelacion(userID, entradaID)
	if !errors.Is(errSegunda, services.ErrEntradaYaCancelada) {
		t.Errorf("Se esperaba ErrEntradaYaCancelada, recibido: %v", errSegunda)
	}
}

func TestQRService_GeneracionYValidacionEnPuerta(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	entradaDAO := sqliteimpl.NewEntradaDAOSQLite(db)
	settings := &core.Settings{
		SecretKey:            "test-secret-key-2026",
		QRSecretKey:          "test-qr-secret-key-2026",
		QRTokenExpireMinutes: 30,
	}
	qrService := services.NewQRService(entradaDAO, settings)

	userID := "usr-qr-1"
	entradaID := uuid.New().String()

	_ = entradaDAO.Create(&models.Entrada{
		IDEntrada:     entradaID,
		IDFestival:    "fest_subsonic_2026",
		UserID:        userID,
		Tipo:          models.TipoVIP,
		FechaCompra:   time.Now().UTC(),
		Estado:        models.EstadoValida,
		TransaccionID: "tx-qr-test",
	})

	// 1. Generar token QR
	resQR, err := qrService.GenerarTokenQR(userID, entradaID)
	if err != nil || resQR.TokenQR == "" {
		t.Fatalf("Fallo al generar Token QR: %v", err)
	}

	// 2. Validar token QR en puerta (primer escaneo = éxito)
	valRes, err := qrService.ValidarAccesoQR(resQR.TokenQR)
	if err != nil {
		t.Fatalf("Primer escaneo debió ser válido: %v", err)
	}
	if !valRes.EstadoAcceso {
		t.Errorf("Se esperaba estado_acceso = true")
	}

	// 3. Segundo escaneo del mismo QR en puerta (debe fallar con ErrQREntradaYaUsada)
	_, errSegundo := qrService.ValidarAccesoQR(resQR.TokenQR)
	if !errors.Is(errSegundo, services.ErrQREntradaYaUsada) {
		t.Errorf("Se esperaba ErrQREntradaYaUsada en el segundo escaneo, obtenido: %v", errSegundo)
	}

	// 4. Intentar generar QR de una entrada ya Usada debe ser rechazado
	_, errGenerarUsada := qrService.GenerarTokenQR(userID, entradaID)
	if !errors.Is(errGenerarUsada, services.ErrQREntradaYaUsada) {
		t.Errorf("Se esperaba rechazo al generar QR para entrada Usada, obtenido: %v", errGenerarUsada)
	}

	// 5. Validar un token corrupto / inválido
	_, errInvalido := qrService.ValidarAccesoQR("token.falso.invalido")
	if !errors.Is(errInvalido, services.ErrQRInvalidoOExpirado) {
		t.Errorf("Se esperaba ErrQRInvalidoOExpirado para token corrupto, obtenido: %v", errInvalido)
	}
}
