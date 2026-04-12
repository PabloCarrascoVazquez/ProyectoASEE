import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import Blueprint, request, jsonify

SECRET_KEY = "tu_clave_secreta_super_segura" # Debería estar en un .env

class AuthService:
    @staticmethod
    def hash_password(password):
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    @staticmethod
    def check_password(password, hashed_password):
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

    @staticmethod
    def generate_token(user_id, role):
        payload = {
            'user_id': user_id,
            'role': role,
            'exp': datetime.utcnow() + timedelta(days=1) # El token expira en 24h
        }
        return jwt.encode(payload, SECRET_KEY, algorithm='HS256')
    
    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            if 'Authorization' in request.headers:
                token = request.headers['Authorization'].split(" ")[1]

            if not token:
                return jsonify({'message': 'Token ausente'}), 401

            try:
                data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                current_user_id = data['sub']
            except:
                return jsonify({'message': 'Token inválido'}), 401

            return f(current_user_id, *args, **kwargs)
        return decorated