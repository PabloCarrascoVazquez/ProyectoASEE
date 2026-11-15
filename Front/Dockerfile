FROM nginx:alpine

# Limpiar los archivos por defecto de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copiar todos los archivos de tu carpeta Front al servidor web
COPY . /usr/share/nginx/html

# Exponer el puerto interno 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]