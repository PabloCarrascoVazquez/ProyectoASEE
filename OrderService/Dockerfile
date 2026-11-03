# Etapa 1: Construcción
FROM golang:1.22-alpine AS builder
WORKDIR /app

# Descargar dependencias primero (aprovecha la caché de Docker)
COPY go.mod go.sum ./
RUN go mod download

# Copiar el resto del código y compilar
COPY . .
RUN go build -o orderservice main.go

# Etapa 2: Ejecución (Imagen ultraligera)
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/orderservice .
COPY .env . 

EXPOSE 8005
CMD ["./orderservice"]