from flask import Flask
from flask_cors import CORS
from app.routes.event_routes import event_bp
from app.routes.merch_routes import merch_bp

app = Flask(__name__)

# IMPORTANTE: CORS permite que tu Front (puerto 5173 o 3000) hable con el Back (5000)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}) 

# Registro de Blueprints
app.register_blueprint(event_bp)
app.register_blueprint(merch_bp)

@app.route('/')
def health_check():
    return {"status": "Subsonic API is running", "version": "1.0.0"}, 200

if __name__ == '__main__':
    print("🚀 Servidor Subsonic arrancando en http://localhost:5000")
    app.run(debug=True, port=5000)