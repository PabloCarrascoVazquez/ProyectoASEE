from app import create_app
from app.core.config import settings

# Instanciamos la aplicación Flask usando nuestra factoría
app = create_app()

if __name__ == "__main__":
    print(f"🚀 Arrancando {settings.PROJECT_NAME}...")
    print(f"📍 API disponible en: http://{settings.DB_HOST}:{settings.PORT}/")
    print(f"📖 Health Check en: http://{settings.DB_HOST}:{settings.PORT}/")
    
    # Arrancamos el servidor usando el puerto 8002 que definimos en config.py
    app.run(host="0.0.0.0", port=settings.PORT, debug=True)