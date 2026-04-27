# 1. Imagen base de Python
FROM python:3.9-slim

# 2. Directorio de trabajo dentro del contenedor
WORKDIR /app

# 3. Copiamos el archivo de dependencias e instalamos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 4. Copiamos todo el código del proyecto al contenedor
COPY . .

# 5. Exponemos el puerto que usa Flask
EXPOSE 5000

# 6. Comando para arrancar la aplicación
CMD ["python", "main.py"]