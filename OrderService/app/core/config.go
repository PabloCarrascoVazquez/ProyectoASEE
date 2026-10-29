// Package core contiene la configuración centralizada del microservicio.
// Equivalente a app/core/config.py de UserService.
package core

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/joho/godotenv"
)

// Settings agrupa toda la configuración de la aplicación.
// Se lee de las variables de entorno (y del fichero .env si existe).
type Settings struct {
	ProjectName string
	Version     string
	Port        int

	// --- Configuración CORS ---
	CORSOrigins []string

	// --- Seguridad y JWT ---
	SecretKey            string   // Mismo secreto que el resto de microservicios (tokens de acceso)
	QRSecretKey          string   // Secreto independiente para firmar los tokens QR
	QRTokenExpireMinutes int      // Validez de cada token QR generado
	StaffRoles           []string // Roles autorizados a validar QR en puerta

	// --- Base de Datos ---
	DBEngine     string // 'sqlite' o 'mysql'
	DBHost       string
	DBPort       int
	DBUser       string
	DBPassword   string
	DBName       string
	SQLiteDBPath string

	// --- RabbitMQ (eventos de compra publicados por PurchaseService) ---
	RabbitMQEnabled          bool
	RabbitMQHost             string
	RabbitMQPort             int
	RabbitMQUsername         string
	RabbitMQPassword         string
	RabbitMQReconnectSeconds int
}

// LoadSettings lee la configuración del entorno. Las variables del sistema
// tienen prioridad sobre las definidas en el .env.
func LoadSettings() (*Settings, error) {
	_ = godotenv.Load() // El .env es opcional

	s := &Settings{
		ProjectName: getEnv("PROJECT_NAME", "Subsonic Festival API - Order Service"),
		Version:     getEnv("VERSION", "1.0.0"),
		Port:        getEnvInt("PORT", 8005),

		CORSOrigins: getEnvList("CORS_ORIGINS", []string{
			"http://localhost:5173",
			"http://127.0.0.1:5173",
			"http://localhost:3000",
		}),

		SecretKey:            os.Getenv("SECRET_KEY"),
		QRSecretKey:          os.Getenv("QR_SECRET_KEY"),
		QRTokenExpireMinutes: getEnvInt("QR_TOKEN_EXPIRE_MINUTES", 60),
		StaffRoles:           getEnvList("STAFF_ROLES", []string{"admin", "staff"}),

		DBEngine:     strings.ToLower(getEnv("DB_ENGINE", "sqlite")),
		DBHost:       getEnv("DB_HOST", "127.0.0.1"),
		DBPort:       getEnvInt("DB_PORT", 3306),
		DBUser:       getEnv("DB_USER", "root"),
		DBPassword:   getEnv("DB_PASSWORD", ""),
		DBName:       getEnv("DB_NAME", "orders_db"),
		SQLiteDBPath: getEnv("SQLITE_DB_PATH", "orders.db"),

		RabbitMQEnabled:          getEnvBool("RABBITMQ_ENABLED", true),
		RabbitMQHost:             getEnv("RABBITMQ_HOST", "localhost"),
		RabbitMQPort:             getEnvInt("RABBITMQ_PORT", 5672),
		RabbitMQUsername:         getEnv("RABBITMQ_USERNAME", "guest"),
		RabbitMQPassword:         getEnv("RABBITMQ_PASSWORD", "guest"),
		RabbitMQReconnectSeconds: getEnvInt("RABBITMQ_RECONNECT_SECONDS", 10),
	}

	// Igual que en UserService: sin SECRET_KEY la aplicación no arranca
	if s.SecretKey == "" {
		return nil, errors.New("SECRET_KEY es obligatoria (defínela en el .env)")
	}
	if s.QRSecretKey == "" {
		s.QRSecretKey = s.SecretKey + "-qr"
	}
	if s.DBEngine != "sqlite" && s.DBEngine != "mysql" {
		return nil, fmt.Errorf("motor de base de datos no soportado: %s", s.DBEngine)
	}
	return s, nil
}

func getEnv(key, def string) string {
	if v, ok := os.LookupEnv(key); ok && strings.TrimSpace(v) != "" {
		return strings.TrimSpace(v)
	}
	return def
}

func getEnvInt(key string, def int) int {
	if v, err := strconv.Atoi(getEnv(key, "")); err == nil {
		return v
	}
	return def
}

func getEnvBool(key string, def bool) bool {
	if v, err := strconv.ParseBool(getEnv(key, "")); err == nil {
		return v
	}
	return def
}

// getEnvList acepta una lista JSON (["a","b"]) como en los .env de los otros
// servicios, o una lista separada por comas (a,b).
func getEnvList(key string, def []string) []string {
	raw := getEnv(key, "")
	if raw == "" {
		return def
	}
	var list []string
	if strings.HasPrefix(raw, "[") && json.Unmarshal([]byte(raw), &list) == nil {
		return list
	}
	for _, item := range strings.Split(raw, ",") {
		if item = strings.TrimSpace(item); item != "" {
			list = append(list, item)
		}
	}
	if len(list) == 0 {
		return def
	}
	return list
}
