#!/bin/bash
set -e

cd ~/ProyectoASEE

# 1. Detectar IP pública actual de EC2 (o usar argumento si se pasa)
if [ -n "$1" ]; then
  PUBLIC_IP="$1"
else
  TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
  PUBLIC_IP=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/public-ipv4)
fi

echo "========================================================"
echo " Desplegando Subsonic Festival en k3s (IP: $PUBLIC_IP)"
echo "========================================================"

# 2. Parar Docker Compose si estuviera activo
docker compose down 2>/dev/null || true

# 3. Permisos de kubectl
mkdir -p ~/.kube
sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config
sudo chown $USER:$USER ~/.kube/config
export KUBECONFIG=~/.kube/config

# 4. Actualizar CORS_ORIGINS con la IP actual
sed -i -E "s|CORS_ORIGINS:.*|CORS_ORIGINS: '[\"http://localhost:5173\", \"http://127.0.0.1:5173\", \"http://localhost:3000\", \"http://localhost:48080\", \"http://${PUBLIC_IP}\"]'|g" k8s/00-configmap-and-secrets.yaml

# 5. Reconstruir imágenes e importarlas en k3s
docker build -t subsonic-userservice:latest ./UserService
docker build -t subsonic-catalogservice:latest ./CatalogService
docker build -t subsonic-purchaseservice:latest ./PurchaseService
docker build -t subsonic-shipinventoryservice:latest ./ShipInventoryService
docker build -t subsonic-orderservice:latest ./OrderService
docker build -t subsonic-frontend:latest ./Front

docker save subsonic-userservice:latest subsonic-catalogservice:latest subsonic-purchaseservice:latest subsonic-shipinventoryservice:latest subsonic-orderservice:latest subsonic-frontend:latest | sudo k3s ctr images import -

# 6. Aplicar manifiestos y reiniciar pods para cargar cambios
kubectl apply -f ./k8s/
kubectl rollout restart deployment frontend userservice catalogservice purchaseservice shipinventoryservice orderservice gateway

sleep 15
kubectl get pods
echo ""
kubectl get svc gateway
echo ""
echo "Aplicación disponible en: http://${PUBLIC_IP}"