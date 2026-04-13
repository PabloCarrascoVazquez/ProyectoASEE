from flask import Flask
from flask_cors import CORS
from app.routes.NoLogin.event_routes import event_bp
from app.routes.NoLogin.merch_routes import merch_bp
from app.routes.User.user_routes import profile_bp
from app.routes.User.purchase_routes import purchase_bp
from app.routes.User.auth_routes import auth_bp
from dotenv import load_dotenv


app = Flask(__name__)
load_dotenv()

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
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(purchase_bp)

@app.route('/')
def health_check():
    return {"status": "Subsonic API is running", "version": "1.0.0"}, 200

if __name__ == '__main__':
    print("🚀 Servidor Subsonic arrancando en http://localhost:5000")
    app.run(debug=True, port=5000)