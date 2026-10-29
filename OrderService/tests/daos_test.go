package tests

import (
	"database/sql"
	"testing"
	"time"

	"orderservice/app/daos/sqlite_impl"
	"orderservice/app/models"

	"github.com/google/uuid"
	_ "modernc.org/sqlite"
)

func setupTestDB(t *testing.T) *sql.DB {
	t.Helper()
	// Base de datos en memoria para pruebas rápidas e independientes
	db, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		t.Fatalf("Error abriendo sqlite en memoria: %v", err)
	}

	schema := `
	CREATE TABLE entradas (
		id_entrada VARCHAR(36) PRIMARY KEY,
		id_festival VARCHAR(100) NOT NULL,
		user_id VARCHAR(36) NOT NULL,
		tipo VARCHAR(20) NOT NULL,
		fecha_compra DATETIME NOT NULL,
		estado VARCHAR(20) NOT NULL DEFAULT 'Valida',
		transaccion_id VARCHAR(100) NULL,
		fecha_uso DATETIME NULL
	);

	CREATE TABLE cancelaciones (
		id_cancelacion VARCHAR(36) PRIMARY KEY,
		id_entrada VARCHAR(36) NOT NULL,
		user_id VARCHAR(36) NOT NULL,
		estado_devolucion VARCHAR(50) NOT NULL DEFAULT 'En proceso',
		fecha_solicitud DATETIME NOT NULL,
		motivo VARCHAR(255) NULL
	);
	`
	if _, err := db.Exec(schema); err != nil {
		t.Fatalf("Error creando esquema de test: %v", err)
	}

	return db
}

func TestEntradaDAOSQLite_CRUD(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	dao := sqliteimpl.NewEntradaDAOSQLite(db)

	entradaID := uuid.New().String()
	userID := "usr-123"
	entrada := &models.Entrada{
		IDEntrada:     entradaID,
		IDFestival:    "fest_subsonic_2026",
		UserID:        userID,
		Tipo:          models.TipoVIP,
		FechaCompra:   time.Now().UTC(),
		Estado:        models.EstadoValida,
		TransaccionID: "tx-abc-999",
	}

	// 1. Create
	if err := dao.Create(entrada); err != nil {
		t.Fatalf("Fallo al crear entrada: %v", err)
	}

	// 2. GetByID
	recuperada, err := dao.GetByID(entradaID)
	if err != nil {
		t.Fatalf("Fallo al consultar por ID: %v", err)
	}
	if recuperada == nil {
		t.Fatalf("Se esperaba encontrar la entrada y devolvió nil")
	}
	if recuperada.Tipo != models.TipoVIP || recuperada.Estado != models.EstadoValida {
		t.Errorf("Datos no coinciden: %+v", recuperada)
	}

	// 3. ExistsByTransactionID
	existe, err := dao.ExistsByTransactionID("tx-abc-999")
	if err != nil || !existe {
		t.Errorf("Se esperaba que existiera la transacción tx-abc-999")
	}
	noExiste, err := dao.ExistsByTransactionID("tx-inexistente")
	if err != nil || noExiste {
		t.Errorf("No debía existir la transacción tx-inexistente")
	}

	// 4. GetByUserID
	entradasUsuario, err := dao.GetByUserID(userID)
	if err != nil || len(entradasUsuario) != 1 {
		t.Fatalf("Se esperaba 1 entrada para el usuario %s, obtenidas: %d", userID, len(entradasUsuario))
	}

	// 5. MarcarComoUsada (primera vez debe dar true, segunda vez false)
	marcada, err := dao.MarcarComoUsada(entradaID, time.Now().UTC())
	if err != nil || !marcada {
		t.Fatalf("La primera marcación a Usada debió retornar true")
	}

	// Segunda marcación inmediata debe retornar false porque ya no es 'Valida'
	marcadaSegunda, err := dao.MarcarComoUsada(entradaID, time.Now().UTC())
	if err != nil || marcadaSegunda {
		t.Fatalf("La segunda marcación debió retornar false por protección de doble uso")
	}

	// 6. ActualizarEstado a Cancelada
	actualizado, err := dao.ActualizarEstado(entradaID, models.EstadoCancelada)
	if err != nil || !actualizado {
		t.Fatalf("Fallo al actualizar estado a Cancelada")
	}
	cancelada, _ := dao.GetByID(entradaID)
	if cancelada.Estado != models.EstadoCancelada {
		t.Errorf("Se esperaba estado Cancelada, obtenido: %s", cancelada.Estado)
	}
}

func TestEntradaDAOSQLite_CreateBatch(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	dao := sqliteimpl.NewEntradaDAOSQLite(db)

	userID := "usr-batch-1"
	lote := []*models.Entrada{
		{
			IDEntrada:     uuid.New().String(),
			IDFestival:    "fest_2026",
			UserID:        userID,
			Tipo:          models.TipoGeneral,
			FechaCompra:   time.Now().UTC(),
			Estado:        models.EstadoValida,
			TransaccionID: "tx-lote-1",
		},
		{
			IDEntrada:     uuid.New().String(),
			IDFestival:    "fest_2026",
			UserID:        userID,
			Tipo:          models.TipoAbono,
			FechaCompra:   time.Now().UTC(),
			Estado:        models.EstadoValida,
			TransaccionID: "tx-lote-1",
		},
	}

	if err := dao.CreateBatch(lote); err != nil {
		t.Fatalf("Fallo en CreateBatch: %v", err)
	}

	entradas, err := dao.GetByUserID(userID)
	if err != nil || len(entradas) != 2 {
		t.Fatalf("Se esperaban 2 entradas del lote, obtenidas: %d", len(entradas))
	}
}

func TestCancelacionDAOSQLite_CRUD(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	dao := sqliteimpl.NewCancelacionDAOSQLite(db)

	cID := uuid.New().String()
	entradaID := uuid.New().String()
	userID := "usr-canc-1"

	c := &models.Cancelacion{
		IDCancelacion:    cID,
		IDEntrada:        entradaID,
		UserID:           userID,
		EstadoDevolucion: "En proceso",
		FechaSolicitud:   time.Now().UTC(),
		Motivo:           "Imposibilidad de asistir",
	}

	if err := dao.Create(c); err != nil {
		t.Fatalf("Fallo al crear cancelación: %v", err)
	}

	porEntrada, err := dao.GetByEntradaID(entradaID)
	if err != nil || porEntrada == nil {
		t.Fatalf("Se esperaba encontrar la cancelación por entradaID")
	}
	if porEntrada.EstadoDevolucion != "En proceso" || porEntrada.Motivo != "Imposibilidad de asistir" {
		t.Errorf("Datos de cancelación incorrectos: %+v", porEntrada)
	}

	listaUser, err := dao.GetByUserID(userID)
	if err != nil || len(listaUser) != 1 {
		t.Fatalf("Se esperaba 1 cancelación para el usuario, obtenidas: %d", len(listaUser))
	}
}
