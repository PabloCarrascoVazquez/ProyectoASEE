from flask import Flask
from flask_cors import CORS
from app.routes.NoLogin.event_routes import event_bp
from app.routes.NoLogin.merch_routes import merch_bp
from app.routes.User.user_routes import profile_bp
from app.routes.User.purchase_routes import purchase_bp
from app.routes.User.auth_routes import auth_bp
from app.routes.Admin.admin_routes import admin_bp
from app.routes.Vendor.vendor_routes import vendor_bp
from dotenv import load_dotenv


app = Flask(__name__)
load_dotenv()

# CORS: permite al Front (Vite en 5173) hablar con el Back (5000).
# Incluimos PUT y DELETE porque ahora admin y vendor los necesitan.
CORS(app, resources={
    r"/api/*": {
        # Añade aquí tu dominio de DuckDNS
        "origins": [
            "http://localhost:5173", 
            "http://localhost",
            "http://subsonic-festival.duckdns.org" 
            "https://subsonic-festival-cqezhvg0cnewhrgc.swedencentral-01.azurewebsites.net"
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Registro de Blueprints
app.register_blueprint(event_bp)
app.register_blueprint(merch_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(purchase_bp)
app.register_blueprint(admin_bp)
app.register_blueprint(vendor_bp)


@app.route('/')
def health_check():
    return {"status": "Subsonic API is running", "version": "1.0.0"}, 200


if __name__ == '__main__':
    print("🚀 Servidor Subsonic arrancando en el puerto 5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
