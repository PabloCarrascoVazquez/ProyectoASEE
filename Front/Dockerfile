# ETAPA 1: Construcción (Build)
# Usamos Node para compilar el proyecto
FROM node:18-alpine AS build

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiamos el resto del código y generamos la carpeta /dist
COPY . .
RUN npm run build

# ETAPA 2: Servidor de Producción (Nginx)
# Usamos una imagen ligera de Nginx para servir los archivos estáticos
FROM nginx:stable-alpine

# Copiamos los archivos compilados desde la etapa anterior a la carpeta de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponemos el puerto 80 (puerto estándar web)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]