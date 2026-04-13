import jwt
import os
import bcrypt
from datetime import datetime, timedelta
from flask import request, jsonify, Blueprint
from functools import wraps
from app.services.user_service import UserService
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv('SECRET_KEY')
auth_bp = Blueprint('auth_bp', __name__)
user_service = UserService()

# 1. El DECORADOR
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if len(auth_header.split(" ")) > 1:
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'message': 'Token inexistente'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
        except Exception as e:
            return jsonify({'message': 'Token inválido o expirado', 'error': str(e)}), 401

        return f(current_user_id, *args, **kwargs)
    return decorated

# 2. La CLASE (Solo para utilidades de tokens y passwords)
class AuthService:
    @staticmethod
    def generate_token(user_id, role):
        payload = {
            'exp': datetime.utcnow() + timedelta(days=1),
            'iat': datetime.utcnow(),
            'user_id': user_id,
            'role': role
        }
        return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

    @staticmethod
    def check_password(password, hashed_password):
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password)

# 3. LAS RUTAS (Fuera de la clase, al mismo nivel que 'def token_required')
@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    try:
        uid = user_service.register_user(data['name'], data['email'], data['password'])
        return jsonify({"user_id": uid}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    user = user_service.authenticate_user(data['email'], data['password'])
    if user:
        token = AuthService.generate_token(user['id'], user['role'])
        return jsonify({
            "token": token,
            "user": {"id": user['id'], "name": user['name'], "role": user['role']}
        }), 200
    return jsonify({"message": "Credenciales incorrectas"}), 401