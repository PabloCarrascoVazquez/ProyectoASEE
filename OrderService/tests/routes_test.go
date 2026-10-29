package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"orderservice/app"
	"orderservice/app/core"
	"orderservice/app/dtos"
	"orderservice/app/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

const (
	testSecret   = "super-test-secret-key-2026"
	testQRSecret = "super-test-qr-secret-key-2026"
)

func generateTestToken(userID, role string) string {
	claims := jwt.MapClaims{
		"sub":     userID,
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(1 * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, _ := token.SignedString([]byte(testSecret))
	return tokenString
}

func setupTestApp(t *testing.T) (*app.Application, string, string) {
	t.Helper()
	db := setupTestDB(t)

	cfg := &core.Settings{
		ProjectName:          "Test Order Service",
		Version:              "1.0.0",
		SecretKey:            testSecret,
		QRSecretKey:          testQRSecret,
		QRTokenExpireMinutes: 30,
		StaffRoles:           []string{"admin", "staff"},
		DBEngine:             "sqlite",
	}

	application := app.CreateApp(cfg, db)

	clientToken := generateTestToken("client-123", "client")
	staffToken := generateTestToken("staff-456", "staff")

	return application, clientToken, staffToken
}

func TestRoutes_HealthCheck(t *testing.T) {
	application, _, _ := setupTestApp(t)

	req := httptest.NewRequest("GET", "/", nil)
	w := httptest.NewRecorder()
	application.Handler.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("Se esperaba 200 en health check, obtenido: %d", w.Code)
	}

	var res map[string]interface{}
	if err := json.Unmarshal(w.Body.Bytes(), &res); err != nil {
		t.Fatalf("JSON inválido en respuesta de health check: %v", err)
	}
	if res["status"] != "running" {
		t.Errorf("Se esperaba status 'running', obtenido: %v", res["status"])
	}
}

func TestRoutes_MisEntradas_Auth(t *testing.T) {
	application, clientToken, _ := setupTestApp(t)

	// 1. Petición sin token -> 401
	reqSinToken := httptest.NewRequest("GET", "/api/pedidos/mis-entradas", nil)
	w1 := httptest.NewRecorder()
	application.Handler.ServeHTTP(w1, reqSinToken)
	if w1.Code != http.StatusUnauthorized {
		t.Errorf("Se esperaba 401 sin token, obtenido: %d", w1.Code)
	}

	// 2. Petición con token -> 200
	reqConToken := httptest.NewRequest("GET", "/api/pedidos/mis-entradas", nil)
	reqConToken.Header.Set("Authorization", "Bearer "+clientToken)
	w2 := httptest.NewRecorder()
	application.Handler.ServeHTTP(w2, reqConToken)
	if w2.Code != http.StatusOK {
		t.Errorf("Se esperaba 200 con token válido, obtenido: %d", w2.Code)
	}
}

func TestRoutes_FlujoCompletoQR_Y_Puerta(t *testing.T) {
	application, clientToken, staffToken := setupTestApp(t)

	// Insertar entrada para el cliente
	entradaID := uuid.New().String()
	_ = application.DAOFactory.GetEntradaDAO().Create(&models.Entrada{
		IDEntrada:     entradaID,
		IDFestival:    "fest_subsonic_2026",
		UserID:        "client-123",
		Tipo:          models.TipoVIP,
		FechaCompra:   time.Now().UTC(),
		Estado:        models.EstadoValida,
		TransaccionID: "tx-http-test",
	})

	// 1. Cliente solicita su token QR
	reqQR := httptest.NewRequest("GET", "/api/pedidos/mis-entradas/"+entradaID+"/qr", nil)
	reqQR.Header.Set("Authorization", "Bearer "+clientToken)
	wQR := httptest.NewRecorder()
	application.Handler.ServeHTTP(wQR, reqQR)

	if wQR.Code != http.StatusOK {
		t.Fatalf("Error al obtener token QR: status %d, body: %s", wQR.Code, wQR.Body.String())
	}

	var qrResp dtos.TokenQRResponse
	_ = json.Unmarshal(wQR.Body.Bytes(), &qrResp)
	if qrResp.TokenQR == "" {
		t.Fatalf("Token QR vino vacío")
	}

	// 2. Intento de validación por cliente común (sin rol staff) -> 403 Forbidden
	bodyReq, _ := json.Marshal(dtos.ValidacionQRRequest{TokenQR: qrResp.TokenQR})
	reqNoStaff := httptest.NewRequest("POST", "/api/acceso/validar-qr", bytes.NewReader(bodyReq))
	reqNoStaff.Header.Set("Authorization", "Bearer "+clientToken)
	reqNoStaff.Header.Set("Content-Type", "application/json")
	wNoStaff := httptest.NewRecorder()
	application.Handler.ServeHTTP(wNoStaff, reqNoStaff)

	if wNoStaff.Code != http.StatusForbidden {
		t.Errorf("Se esperaba 403 Forbidden para usuario sin rol staff/admin, obtenido: %d", wNoStaff.Code)
	}

	// 3. Validación por personal Staff -> 200 OK
	reqStaff := httptest.NewRequest("POST", "/api/acceso/validar-qr", bytes.NewReader(bodyReq))
	reqStaff.Header.Set("Authorization", "Bearer "+staffToken)
	reqStaff.Header.Set("Content-Type", "application/json")
	wStaff := httptest.NewRecorder()
	application.Handler.ServeHTTP(wStaff, reqStaff)

	if wStaff.Code != http.StatusOK {
		t.Fatalf("Se esperaba 200 OK para staff en puerta, obtenido: %d. Body: %s", wStaff.Code, wStaff.Body.String())
	}

	var valResp dtos.ValidacionQRResponse
	_ = json.Unmarshal(wStaff.Body.Bytes(), &valResp)
	if !valResp.EstadoAcceso {
		t.Errorf("Se esperaba estado_acceso = true")
	}

	// 4. Segundo escaneo en puerta -> 403 Forbidden (Entrada ya escaneada)
	reqReintento := httptest.NewRequest("POST", "/api/acceso/validar-qr", bytes.NewReader(bodyReq))
	reqReintento.Header.Set("Authorization", "Bearer "+staffToken)
	reqReintento.Header.Set("Content-Type", "application/json")
	wReintento := httptest.NewRecorder()
	application.Handler.ServeHTTP(wReintento, reqReintento)

	if wReintento.Code != http.StatusForbidden {
		t.Errorf("Se esperaba 403 en segundo escaneo (ya usada), obtenido: %d", wReintento.Code)
	}
}

func TestRoutes_Cancelaciones(t *testing.T) {
	application, clientToken, _ := setupTestApp(t)

	entradaID := uuid.New().String()
	_ = application.DAOFactory.GetEntradaDAO().Create(&models.Entrada{
		IDEntrada:     entradaID,
		IDFestival:    "fest_subsonic_2026",
		UserID:        "client-123",
		Tipo:          models.TipoGeneral,
		FechaCompra:   time.Now().UTC(),
		Estado:        models.EstadoValida,
		TransaccionID: "tx-canc-test",
	})

	// 1. Cancelación exitosa -> 201 Created
	reqCanc := httptest.NewRequest("POST", "/api/pedidos/"+entradaID+"/cancelaciones", nil)
	reqCanc.Header.Set("Authorization", "Bearer "+clientToken)
	wCanc := httptest.NewRecorder()
	application.Handler.ServeHTTP(wCanc, reqCanc)

	if wCanc.Code != http.StatusCreated {
		t.Fatalf("Se esperaba 201 Created al solicitar cancelación, obtenido: %d. Body: %s", wCanc.Code, wCanc.Body.String())
	}

	var cancResp dtos.CancelacionResponse
	_ = json.Unmarshal(wCanc.Body.Bytes(), &cancResp)
	if cancResp.EstadoDevolucion != "En proceso" || cancResp.IDEntrada != entradaID {
		t.Errorf("Respuesta de cancelación inesperada: %+v", cancResp)
	}

	// 2. Segunda cancelación de la misma entrada -> 400 Bad Request
	reqSegunda := httptest.NewRequest("POST", "/api/pedidos/"+entradaID+"/cancelaciones", nil)
	reqSegunda.Header.Set("Authorization", "Bearer "+clientToken)
	wSegunda := httptest.NewRecorder()
	application.Handler.ServeHTTP(wSegunda, reqSegunda)

	if wSegunda.Code != http.StatusBadRequest {
		t.Errorf("Se esperaba 400 Bad Request al intentar cancelar de nuevo, obtenido: %d", wSegunda.Code)
	}
}
