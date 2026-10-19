from flask import Flask, jsonify
from flask_cors import CORS
from app.core.config import settings
from app.routes.user_routes import user_bp

def create_app() -> Flask:
    app = Flask(__name__)

    # Configuración de CORS profesional usando Pydantic Settings
    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": settings.CORS_ORIGINS,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"]
            }
        }
    )

    # Registro de rutas del microservicio
    app.register_blueprint(user_bp)

    # Health check de estado
    @app.route("/")
    def health_check():
        return jsonify({
            "service": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "status": "running"
        }), 200

    return app