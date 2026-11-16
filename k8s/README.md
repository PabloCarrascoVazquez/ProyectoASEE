# Despliegue en Kubernetes (`k8s/`) — Subsonic Festival

Esta carpeta contiene todos los manifiestos de Kubernetes para desplegar la arquitectura de microservicios de **Subsonic Festival**.

---

## Estructura de Manifiestos

| Archivo | Recursos Kubernetes | Descripción |
|---|---|---|
| `00-configmap-and-secrets.yaml` | `ConfigMap` (`subsonic-config`), `Secret` (`subsonic-secrets`) | Configuración global unificada y claves secretas (`SECRET_KEY`, `QR_SECRET_KEY`, credenciales). |
| `01-rabbitmq.yaml` | `Deployment` + `Service` (`ClusterIP`) | Broker de mensajería asíncrona RabbitMQ (`5672` AMQP, `15672` Management). |
| `02-userservice.yaml` | `Deployment` + `Service` (`ClusterIP`) | Microservicio de Usuarios y Autenticación (`8001`). |
| `03-catalogservice.yaml` | `Deployment` + `Service` (`ClusterIP`) | Microservicio de Catálogo de Festivales, Entradas y Espacios (`8002`). |
| `04-purchaseservice.yaml` | `Deployment` + `Service` (`ClusterIP`) | Microservicio Transaccional de Compras y Outbox (`8003`). |
| `05-shipinventoryservice.yaml` | `Deployment` + `Service` (`ClusterIP`) | Microservicio de Inventario y Envíos Logísticos (`8004`). |
| `06-orderservice.yaml` | `Deployment` + `Service` (`ClusterIP`) | Microservicio de Pedidos, Billetera (Wallet) y Validación QR (`8005`). |
| `07-gateway.yaml` | `ConfigMap` (`gateway-nginx-config`), `Deployment` + `Service` (`LoadBalancer`) | API Gateway NGINX expuesto hacia el exterior en el puerto **`8000`**. |

---

## Requisitos Previos

1. Tener **Docker Desktop** abierto con **Kubernetes activado** (*Settings → Kubernetes → Enable Kubernetes*).
2. (Importante) Si tenías los contenedores levantados con `docker compose`, apágalos antes para liberar el puerto `8000`:
   ```powershell
   docker compose down
   ```

---

## Cómo desplegar (1 comando)

Desde la raíz del proyecto (`ProyectoASEE`), ejecuta:

```powershell
.\k8s\deploy.ps1
```

### O paso a paso manualmente:

1. **Construir las imágenes de los 5 microservicios:**
   ```powershell
   docker build -t subsonic-userservice:latest ./UserService
   docker build -t subsonic-catalogservice:latest ./CatalogService
   docker build -t subsonic-purchaseservice:latest ./PurchaseService
   docker build -t subsonic-shipinventoryservice:latest ./ShipInventoryService
   docker build -t subsonic-orderservice:latest ./OrderService
   ```

2. **Aplicar todos los manifiestos de Kubernetes:**
   ```powershell
   kubectl apply -f k8s/
   ```

3. **Comprobar que todos los pods están `Running` y `1/1 Ready`:**
   ```powershell
   kubectl get pods
   kubectl get svc
   ```

4. **Probar con Bruno:**
   El servicio `gateway` (`LoadBalancer`) queda escuchando en **`http://localhost:8000`**, exactamente igual que en Docker Compose, por lo que puedes ejecutar directamente la colección **`ScriptUsuarioNormal`** en Bruno sin cambiar nada.

---

## Cómo eliminar el despliegue

```powershell
kubectl delete -f k8s/
```
