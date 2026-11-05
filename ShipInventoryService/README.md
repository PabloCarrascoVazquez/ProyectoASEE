# ShipInventoryService - Microservicio de Inventario y Envíos (Subsonic Festival)

Microservicio encargado de la gestión de stock físico de merchandising en almacén y del tracking de envíos logísticos para el festival Subsonic.

## Tecnologías
- **Java 17 / 21**
- **Spring Boot 3.3.4** (Web, JDBC, AMQP / RabbitMQ, Validation)
- **Base de datos dual**: SQLite (por defecto en local) y MySQL (producción / Docker)
- **RabbitMQ**: Consumidor asíncrono de eventos `ORDER_PAID` en la cola `merch_queue`
- **Seguridad**: Autenticación JWT con verificación de rol `Admin` en endpoints protegidos

## Endpoints

| Método | Endpoint | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/inventario/stock` | Cualquiera (Público) | Consultar stock físico de merchandising disponible |
| `PUT` | `/inventario/{id_producto}` | Admin | Actualizar stock físico en almacén (variación +/-) |
| `POST` | `/inventario/{id_producto}/bloquear` | Token JWT | Bloqueo temporal de unidades para reservas |
| `POST` | `/inventario/{id_producto}/liberar` | Token JWT | Liberar stock temporal por expiración o fallo |
| `GET` | `/envios` | Admin | Listar envíos pendientes de despachar |
| `PUT` | `/envios/{id_envio}/tracking` | Admin | Actualizar tracking y estado logístico del envío |

## Ejecución en local
```bash
mvn clean test
mvn spring-boot:run
```

## Docker
```bash
docker build -t subsonic-shipinventoryservice .
```
