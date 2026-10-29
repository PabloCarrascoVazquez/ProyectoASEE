# OrderService - Microservicio de Pedidos, Billetera y Acceso (Go)

Microservicio del ecosistema **Subsonic Festival** encargado de:
1. Custodiar las entradas digitales adquiridas por los usuarios (**Billetera / Wallet**).
2. Generar tokens criptográficos dinámicos para renderizar **códigos QR**.
3. Validar el acceso en puertas/tornos para personal autorizado (**Staff/Admin**) con protección contra doble uso.
4. Gestionar solicitudes de cancelación y devolución de entradas.
5. Consumir de manera asíncrona los eventos de compra emitidos por `PurchaseService` a través de **RabbitMQ**.

---

## 🏛 Arquitectura y Estructura

El microservicio está desarrollado en **Go (Golang)** replicando fielmente la estructura y principios de diseño de `UserService` y del resto del proyecto:

```
OrderService/
├── main.go                     # Punto de entrada, arranque y graceful shutdown (≈ main.py)
├── go.mod                      # Definición de dependencias Go
├── .env.example                # Variables de entorno de referencia
├── .gitignore
├── app/
│   ├── app.go                  # Ensamblador de dependencias y factory (≈ create_app())
│   ├── core/
│   │   └── config.go           # Configuración centralizada (.env, puertos, secretos)
│   ├── models/
│   │   ├── entrada.go          # Modelo de Entrada (Valida, Usada, Cancelada)
│   │   └── cancelacion.go      # Modelo de Cancelación
│   ├── dtos/
│   │   ├── requests.go         # DTOs de petición y eventos RabbitMQ
│   │   └── responses.go        # DTOs conforme a api-pedidos.yaml
│   ├── daos/
│   │   ├── interfaces.go       # Contratos IEntradaDAO, ICancelacionDAO
│   │   ├── factories.go        # DatabaseConnectionFactory y DAOFactory (SQLite / MySQL)
│   │   ├── esquemaBD.txt       # DDL documentado del servicio
│   │   ├── sqlite_impl/        # Implementación con SQLite
│   │   └── mysql_impl/         # Implementación con MySQL
│   ├── services/
│   │   ├── order_service.go    # Lógica de Wallet y cancelaciones
│   │   ├── qr_service.go       # Generación y validación atómica de QR
│   │   └── ticket_consumer.go  # Consumidor asíncrono de RabbitMQ (ticket_queue)
│   ├── middleware/
│   │   └── auth_middleware.go  # Autenticación JWT y autorización por roles (Staff/Admin)
│   └── routes/
│       └── order_routes.go     # Endpoints HTTP según api-pedidos.yaml
└── tests/
    ├── daos_test.go            # Pruebas unitarias de DAOs (CRUD, idempotencia, concurrencia)
    ├── services_test.go        # Pruebas unitarias de servicios de Wallet y QR
    └── routes_test.go          # Pruebas de integración HTTP (httptest)
```

---

## 📋 Endpoints de la API (`api-pedidos.yaml`)

Base URL: `http://localhost:8005/api` (o a través del Gateway en el puerto `8000`)

| Método | Endpoint | Seguridad | Descripción |
|---|---|---|---|
| `GET` | `/api/pedidos/mis-entradas` | `Bearer JWT` (Usuario) | Lista las entradas digitales activas en la billetera |
| `GET` | `/api/pedidos/mis-entradas/{id_entrada}/qr` | `Bearer JWT` (Usuario) | Genera el token criptográfico firmado para el QR |
| `POST` | `/api/acceso/validar-qr` | `Bearer JWT` (`staff`, `admin`) | Valida el escaneo en puerta y marca la entrada como **Usada** |
| `POST` | `/api/pedidos/{id_entrada}/cancelaciones` | `Bearer JWT` (Usuario) | Inicia el proceso de devolución de una entrada |
| `GET` | `/` | Pública | Health-check del microservicio |

---

## ⚙️ Configuración (`.env`)

Copia el archivo de ejemplo para configurar el entorno local:

```bash
cp .env.example .env
```

Variables principales:
- `PORT=8005`
- `SECRET_KEY=super-secret-subsonic-key-jwt-2026` (Misma clave secreta compartida con UserService / PurchaseService).
- `QR_SECRET_KEY=super-secret-subsonic-qr-key-2026` (Clave de firma de los códigos QR).
- `STAFF_ROLES=["admin", "staff"]` (Roles con permiso para escanear en puertas).
- `DB_ENGINE=sqlite` (Soporta `sqlite` o `mysql`).
- `RABBITMQ_ENABLED=true`
- `RABBITMQ_HOST=localhost`
- `RABBITMQ_PORT=5672`

---

## 🚀 Ejecución y Pruebas

### Descargar dependencias
```bash
go mod tidy
```

### Ejecutar las pruebas automáticas
```bash
go test -v ./tests/...
```

### Iniciar el microservicio
```bash
go run main.go
```
