from app import create_app
from app.core.config import settings
import os
from app.events.order_paid_consumer import start_order_paid_consumer

# Instanciamos la aplicación Flask usando nuestra factoría
app = create_app()

if __name__ == "__main__":
    print(f"🚀 Arrancando {settings.PROJECT_NAME}...")
    print(f"📍 API disponible en: http://{settings.DB_HOST}:{settings.PORT}/")
    print(f"📖 Health Check en: http://{settings.DB_HOST}:{settings.PORT}/")

    # Con debug=True en app.run(), WERKZEUG_RUN_MAIN == "true" evita arrancar 2 hilos duplicados
    if not app.config.get("TESTING") and os.environ.get("WERKZEUG_RUN_MAIN") == "true":
        start_order_paid_consumer()

    # Arrancamos el servidor (bloqueante, debe ir siempre al final)
    app.run(host="0.0.0.0", port=settings.PORT, debug=True)