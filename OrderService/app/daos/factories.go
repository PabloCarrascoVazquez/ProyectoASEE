package daos

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"orderservice/app/core"
	mysqlimpl "orderservice/app/daos/mysql_impl"
	sqliteimpl "orderservice/app/daos/sqlite_impl"

	_ "github.com/go-sql-driver/mysql"
	_ "modernc.org/sqlite"
)

var (
	dbInstance *sql.DB
	dbOnce     sync.Once
	initErr    error
)

// DatabaseConnectionFactory gestiona el ciclo de vida de la conexión a la base de datos
// inicializando el esquema automáticamente si es necesario (equivalente a UserService).
type DatabaseConnectionFactory struct{}

// GetConnection devuelve el pool de conexiones singleton a la base de datos configurada.
func (f *DatabaseConnectionFactory) GetConnection(cfg *core.Settings) (*sql.DB, error) {
	dbOnce.Do(func() {
		switch cfg.DBEngine {
		case "mysql":
			dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?parseTime=true&charset=utf8mb4",
				cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)
			db, err := sql.Open("mysql", dsn)
			if err != nil {
				initErr = fmt.Errorf("error al conectar con MySQL: %w", err)
				return
			}
			db.SetMaxOpenConns(25)
			db.SetMaxIdleConns(5)
			if err := initMySQLSchema(db); err != nil {
				initErr = fmt.Errorf("error al inicializar esquema MySQL: %w", err)
				return
			}
			dbInstance = db

		case "sqlite":
			dbPath := cfg.SQLiteDBPath
			if !filepath.IsAbs(dbPath) {
				// Ruta relativa respecto al directorio de trabajo
				dir, _ := os.Getwd()
				dbPath = filepath.Join(dir, dbPath)
			}
			_ = os.MkdirAll(filepath.Dir(dbPath), 0755)

			dsn := fmt.Sprintf("%s?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)", dbPath)
			db, err := sql.Open("sqlite", dsn)
			if err != nil {
				initErr = fmt.Errorf("error al abrir SQLite (%s): %w", dbPath, err)
				return
			}
			// SQLite funciona mejor con conexiones controladas
			db.SetMaxOpenConns(1)
			if err := initSQLiteSchema(db); err != nil {
				initErr = fmt.Errorf("error al inicializar esquema SQLite: %w", err)
				return
			}
			dbInstance = db

		default:
			initErr = fmt.Errorf("motor de base de datos no soportado: %s", cfg.DBEngine)
		}
	})

	return dbInstance, initErr
}

// CloseConnection cierra la conexión abierta si existe
func (f *DatabaseConnectionFactory) CloseConnection() {
	if dbInstance != nil {
		_ = dbInstance.Close()
		dbInstance = nil
	}
}

// ResetConnectionForTests permite forzar una nueva conexión en las pruebas
func ResetConnectionForTests() {
	if dbInstance != nil {
		_ = dbInstance.Close()
		dbInstance = nil
	}
	dbOnce = sync.Once{}
	initErr = nil
}

func initSQLiteSchema(db *sql.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS entradas (
		id_entrada VARCHAR(36) PRIMARY KEY,
		id_festival VARCHAR(100) NOT NULL,
		user_id VARCHAR(36) NOT NULL,
		tipo VARCHAR(20) NOT NULL,
		fecha_compra DATETIME NOT NULL,
		estado VARCHAR(20) NOT NULL DEFAULT 'Valida',
		transaccion_id VARCHAR(100) NULL,
		fecha_uso DATETIME NULL
	);

	CREATE INDEX IF NOT EXISTS idx_entradas_user_id ON entradas(user_id);
	CREATE INDEX IF NOT EXISTS idx_entradas_transaccion_id ON entradas(transaccion_id);

	CREATE TABLE IF NOT EXISTS cancelaciones (
		id_cancelacion VARCHAR(36) PRIMARY KEY,
		id_entrada VARCHAR(36) NOT NULL,
		user_id VARCHAR(36) NOT NULL,
		estado_devolucion VARCHAR(50) NOT NULL DEFAULT 'En proceso',
		fecha_solicitud DATETIME NOT NULL,
		motivo VARCHAR(255) NULL,
		FOREIGN KEY (id_entrada) REFERENCES entradas(id_entrada)
	);

	CREATE INDEX IF NOT EXISTS idx_cancelaciones_entrada ON cancelaciones(id_entrada);
	CREATE INDEX IF NOT EXISTS idx_cancelaciones_user ON cancelaciones(user_id);
	`
	_, err := db.Exec(schema)
	return err
}

func initMySQLSchema(db *sql.DB) error {
	schemaEntradas := `
	CREATE TABLE IF NOT EXISTS entradas (
		id_entrada VARCHAR(36) PRIMARY KEY,
		id_festival VARCHAR(100) NOT NULL,
		user_id VARCHAR(36) NOT NULL,
		tipo VARCHAR(20) NOT NULL,
		fecha_compra DATETIME NOT NULL,
		estado VARCHAR(20) NOT NULL DEFAULT 'Valida',
		transaccion_id VARCHAR(100) NULL,
		fecha_uso DATETIME NULL,
		INDEX idx_entradas_user_id (user_id),
		INDEX idx_entradas_transaccion_id (transaccion_id)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`
	schemaCancelaciones := `
	CREATE TABLE IF NOT EXISTS cancelaciones (
		id_cancelacion VARCHAR(36) PRIMARY KEY,
		id_entrada VARCHAR(36) NOT NULL,
		user_id VARCHAR(36) NOT NULL,
		estado_devolucion VARCHAR(50) NOT NULL DEFAULT 'En proceso',
		fecha_solicitud DATETIME NOT NULL,
		motivo VARCHAR(255) NULL,
		INDEX idx_cancelaciones_entrada (id_entrada),
		INDEX idx_cancelaciones_user (user_id)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
	`
	if _, err := db.Exec(schemaEntradas); err != nil {
		return err
	}
	_, err := db.Exec(schemaCancelaciones)
	return err
}

// DAOFactory encapsula la creación de los DAOs según el motor de base de datos
type DAOFactory struct {
	db     *sql.DB
	engine string
}

func NewDAOFactory(db *sql.DB, engine string) *DAOFactory {
	return &DAOFactory{db: db, engine: engine}
}

func (f *DAOFactory) GetEntradaDAO() IEntradaDAO {
	if f.engine == "mysql" {
		return mysqlimpl.NewEntradaDAOMySQL(f.db)
	}
	return sqliteimpl.NewEntradaDAOSQLite(f.db)
}

func (f *DAOFactory) GetCancelacionDAO() ICancelacionDAO {
	if f.engine == "mysql" {
		return mysqlimpl.NewCancelacionDAOMySQL(f.db)
	}
	return sqliteimpl.NewCancelacionDAOSQLite(f.db)
}
