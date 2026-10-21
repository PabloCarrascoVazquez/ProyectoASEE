# Microservicio de Compras (Checkout) - Subsonic Festival

Microservicio orquestador transaccional desarrollado con **Java 21/25** y **Spring Boot 3.3.4** para la plataforma **Subsonic Festival**.

---

## 1. Arquitectura y Estructura en Capas

El proyecto implementa de manera estricta el patrón clásico por capas sin dependencias mágicas de Spring Data JPA:

```
com.subsonic.purchaseservice
├── controllers
│   └── PurchaseController.java              # Endpoints REST: /carrito/iniciar y /{id_transaccion}/pagar
├── models
│   ├── Transaction.java                     # Entidad de dominio de la transacción principal
│   ├── TransactionItem.java                 # Líneas de detalle del carrito
│   ├── OutboxEvent.java                     # Evento para el patrón Transactional Outbox
│   ├── TransactionStatus.java               # Enum: PENDING, PAID, EXPIRED, FAILED, CANCELLED
│   ├── TransactionType.java                 # Enum: ticket, merchandise, mixed
│   ├── PaymentMethod.java                   # Enum: tarjeta, paypal, bizum
│   ├── TicketType.java                      # Enum: day, weekend, vip
│   └── ItemType.java                        # Enum: ticket, merchandise
├── dao
│   ├── PurchaseDao.java                     # Interfaz DAO para transacciones y detalles
│   ├── OutboxDao.java                       # Interfaz DAO para eventos de outbox
│   ├── mysql
│   │   ├── PurchaseDaoMySql.java            # Implementación JDBC/JdbcTemplate para MySQL
│   │   └── OutboxDaoMySql.java              # Implementación JDBC/JdbcTemplate para MySQL
│   └── sqlite
│       ├── PurchaseDaoSqlite.java           # Implementación JDBC/JdbcTemplate para SQLite
│       └── OutboxDaoSqlite.java             # Implementación JDBC/JdbcTemplate para SQLite
├── dtos
│   ├── requests
│   │   ├── ReservaCarritoCompletoRequest.java
│   │   ├── ItemEntradaRequest.java
│   │   ├── ItemMerchRequest.java
│   │   ├── DireccionEnvioRequest.java
│   │   ├── ConfirmacionPagoRequest.java
│   │   ├── BloqueoCupoCatalogRequest.java
│   │   └── BloqueoStockInventoryRequest.java
│   └── responses
│       ├── ReservaResponse.java
│       ├── TransaccionResponse.java
│       ├── ErrorResponse.java
│       ├── BloqueoCupoCatalogResponse.java
│       └── BloqueoStockInventoryResponse.java
├── services
│   ├── PurchaseOrchestratorService.java     # Orquestador del flujo transaccional en 2 fases
│   ├── PaymentGatewayAdapter.java           # Interfaz Adapter para pasarelas bancarias
│   ├── StripeRedsysPaymentGatewayAdapter.java # Implementación Adapter (Stripe / Redsys)
│   ├── PaymentRequest.java / PaymentResult.java
│   ├── CatalogClientService.java            # Cliente HTTP para Catálogo con timeouts
│   ├── InventoryClientService.java          # Cliente HTTP para Inventario con timeouts
│   ├── OutboxPublisherWorker.java           # Worker @Scheduled para publicar en RabbitMQ
│   └── ExpirationWorker.java                # Worker @Scheduled para expirar y compensar carritos
├── config
│   ├── DotenvConfig.java                    # Carga automática de .env al arrancar
│   ├── DatabaseConfig.java                  # Configuración DataSource dinámico (SQLite/MySQL)
│   ├── DaoConfig.java                       # Inyección condicional de DAOs según DB_ENGINE
│   ├── HttpClientConfig.java                # RestTemplate (timeouts 3s) y TaskExecutor dedicado
│   ├── RabbitMQConfig.java                  # Exchange y colas (ticket_queue y merch_queue)
│   ├── SchedulerConfig.java                 # Habilitación de tareas en segundo plano
│   ├── CorsConfig.java                      # Configuración CORS desde .env
│   ├── SecurityConfig.java                  # Registro de interceptor de seguridad
│   ├── JwtAuthInterceptor.java              # Validación de JWT y extracción de sub/user_id
│   └── GlobalExceptionHandler.java          # Manejo centralizado de excepciones (400, 401, 403, 404, 409, 500)
└── PurchaseServiceApplication.java          # Clase principal de arranque
```

---

## 2. Base de Datos y Persistencia Dual (MySQL / SQLite)

El microservicio admite conmutación de motor mediante la variable de entorno `DB_ENGINE`:
- `DB_ENGINE=sqlite`: Persiste en base de datos local embebida (`purchases.db`), inicializando automáticamente las tablas con soporte para claves foráneas (`PRAGMA foreign_keys = ON;`).
- `DB_ENGINE=mysql`: Conecta al servidor MySQL configurado en `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASSWORD`.

El acceso a datos se realiza estrictamente a través de `JdbcTemplate` implementando el patrón DAO clásico.

### Tablas:
1. **`transactions`**: UUID, usuario, tipo, importe, divisa, estado del ciclo de vida, fecha de expiración, token y comprobantes de pago.
2. **`transaction_items`**: Desglose de entradas de festival o productos de merchandising adquiridos en el carrito.
3. **`outbox_events`**: Tabla del patrón Transactional Outbox para eventos pendientes de publicación en el bus de mensajería.

---

## 3. Flujo Transaccional en 2 Fases

### Fase 1: Reserva Concurrente (`POST /api/compras/carrito/iniciar`)
1. **Concurrencia obligatoria**: La reserva se procesa levantando dos hilos concurrentes mediante `CompletableFuture` sobre un `ThreadPoolTaskExecutor` dedicado:
   - **Hilo A**: Llama al Servicio de Catálogo (`POST /api/festivales/{id_festival}/entradas/bloquear`) para bloquear aforo de entradas.
   - **Hilo B**: Llama al Servicio de Inventario (`POST /api/inventario/{id_producto}/bloquear`) para bloquear stock físico de merchandising.
2. **Timeouts estrictos**: 3 segundos de connect timeout y 3 segundos de read timeout con manejo robusto de excepciones de conexión.
3. **Sincronización y Rollback Activo**:
   - Si ambos hilos tienen éxito: se crea la transacción en estado `PENDING` con fecha de expiración fijada a **10 minutos**, se persiste en base de datos y se devuelve `200 OK` con el `id_transaccion`.
   - Si uno de los hilos falla o se agota el aforo/stock: se aborta la compra y se ejecuta un **rollback activo de compensación** llamando al endpoint `/liberar` del servicio que sí logró bloquear recursos, devolviendo un error `409 Conflict`.

### Fase 2: Confirmación de Pago (`POST /api/compras/{id_transaccion}/pagar`)
1. **Patrón Adapter (`PaymentGatewayAdapter`)**: Simula la interacción con Stripe/Redsys admitiendo éxito o fallo controlado mediante tokens de prueba (ej. `tok_fail` para simular denegación bancaria).
2. Si el pago falla o la reserva ha superado los 10 minutos: se cancela y se compensa liberando recursos.
3. **Patrón Transactional Outbox**: Si el pago es aceptado por el Adapter, **no se publica directamente a la red**. Dentro de la misma transacción ACID de base de datos (`@Transactional`):
   - Se actualiza el estado de la transacción a `PAID`.
   - Se inserta un registro en la tabla `outbox_events` con el payload del evento y `published = FALSE`.
   - Se retorna `200 OK` con `TransaccionResponse`.

---

## 4. Publicación Asíncrona con RabbitMQ y Workers en Segundo Plano

- **Exchange**: `subsonic.purchases.exchange` (Topic).
- **Colas independientes**:
  - `ticket_queue` (routing key `order.ticket`): Generación de entradas definitivas y tokens QR en el Servicio de Pedidos/Wallet.
  - `merch_queue` (routing key `order.merch`): Despacho logístico en el Servicio de Inventario.

### Workers en segundo plano (`@Scheduled`):
1. **`OutboxPublisherWorker`**: Lee periódicamente registros con `published = FALSE` en `outbox_events`, enruta y publica el evento en RabbitMQ hacia las colas correspondientes y actualiza `published = TRUE` tras la confirmación.
2. **`ExpirationWorker`**: Busca periódicamente transacciones en estado `PENDING` cuyo tiempo `reservation_expires_at` haya vencido (> 10 minutos), actualiza su estado a `EXPIRED` y llama a los endpoints `/liberar` de Catálogo e Inventario para devolver cupos y existencias.

---

## 5. Seguridad y Tokens JWT

- Valida la cabecera `Authorization: Bearer <token>` mediante un interceptor (`JwtAuthInterceptor`) utilizando la clave secreta `SECRET_KEY` configurada en el `.env` (compatible con el esquema HS256 de `UserService`).
- Extrae el claim `sub` (o `user_id`) del token y lo vincula con la transacción.
- En caso de token ausente o expirado, retorna `401 Unauthorized` con el formato JSON estándar:
  ```json
  {
    "codigo": 401,
    "mensaje": "Acceso no autorizado",
    "detalle": "Falta el token Bearer en la cabecera."
  }
  ```

---

## 6. Variables de Entorno (`.env`)

```env
PORT=8003
SECRET_KEY=super-secret-subsonic-key-jwt-2026

# DB_ENGINE=sqlite | mysql
DB_ENGINE=sqlite
SQLITE_DB_PATH=purchases.db

# Configuración MySQL (opcional)
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=purchases_db
DB_USER=root
DB_PASSWORD=root

# CORS
CORS_ORIGINS=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

# Clientes externos
CATALOG_SERVICE_URL=http://localhost:8002/api
INVENTORY_SERVICE_URL=http://localhost:8004/api

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest

# Workers
OUTBOX_WORKER_INTERVAL_MS=30000
EXPIRATION_WORKER_INTERVAL_MS=60000

# Fallback simulado para desarrollo si Catálogo e Inventario no están activos
CATALOG_MOCK_FALLBACK=true
INVENTORY_MOCK_FALLBACK=true
```

---

## 7. Ejecución y Pruebas

### Compilar el proyecto:
```bash
mvn clean compile
```

### Ejecutar la batería de tests:
```bash
mvn test
```

### Arrancar el microservicio:
```bash
mvn spring-boot:run
```

