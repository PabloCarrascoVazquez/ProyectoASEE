# ===================================================================
# Script de Despliegue en Kubernetes - Subsonic Festival
# ===================================================================

$ErrorActionPreference = "Stop"

Write-Host "1/2 Construyendo imágenes Docker locales para Kubernetes..." -ForegroundColor Cyan
docker build -t subsonic-userservice:latest ./UserService
docker build -t subsonic-catalogservice:latest ./CatalogService
docker build -t subsonic-purchaseservice:latest ./PurchaseService
docker build -t subsonic-shipinventoryservice:latest ./ShipInventoryService
docker build -t subsonic-orderservice:latest ./OrderService

Write-Host "`n2/2 Aplicando manifiestos de Kubernetes (k8s/)..." -ForegroundColor Cyan
kubectl apply -f ./k8s/

Write-Host "`nEstado actual de los Pods y Servicios:" -ForegroundColor Green
kubectl get pods
kubectl get svc

Write-Host "`n¡Despliegue completado! El Gateway está expuesto en http://localhost:8000" -ForegroundColor Green
