from app import create_app
from app.core.config import settings

app = create_app()

if __name__ == "__main__":
    print(f"🚀 {settings.PROJECT_NAME} corriendo en http://0.0.0.0:{settings.PORT}")
    app.run(debug=True, host="0.0.0.0", port=settings.PORT)