from flask import Blueprint, request, jsonify
from app.services.user_service import UserService
from app.services.auth_service import AuthService

auth_bp = Blueprint('auth_bp', __name__)
user_service = UserService()

@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    try:
        # El service se encarga de hashear la password antes de guardar
        user = user_service.create_user(
            name=data['name'],
            email=data['email'],
            password=data['password']
        )
        return jsonify({"message": "Usuario registrado", "user_id": user['id']}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = user_service.get_by_email(data['email'])
    
    if user and AuthService.check_password(data['password'], user['password_hash']):
        token = AuthService.generate_token(user['id'], user['role'])
        return jsonify({
            "token": token,
            "user": {"id": user['id'], "name": user['name'], "role": user['role']}
        }), 200
    
    return jsonify({"message": "Credenciales incorrectas"}), 401