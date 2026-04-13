import jwt
import bcrypt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv


load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # 2. Extraer token del header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            # Formato: "Bearer <token>"
            parts = auth_header.split(" ")
            if len(parts) > 1:
                token = parts[1]

        if not token:
            return jsonify({'message': 'Token inexistente'}), 401

        try:
            # 3. Decodificar usando la SECRET_KEY cargada arriba
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'El token ha expirado'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido'}), 401
        except Exception as e:
            return jsonify({'message': 'Error en autenticación', 'error': str(e)}), 401

        # Pasamos el user_id al método de la ruta
        return f(current_user_id, *args, **kwargs)
    
    return decorated

class AuthService:
    @staticmethod
    def hash_password(password):
        # Genera el hash para guardar en DB
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def check_password(password, hashed_password):
        # Verifica la password contra el hash de la DB
        # Aseguramos que el hash de la DB sea bytes para bcrypt
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password)

    @staticmethod
    def generate_token(user_id, role):
        # Crea el JWT para enviar al Frontend
        payload = {
            'user_id': str(user_id),
            'role': role,
            'exp': datetime.utcnow() + timedelta(days=1), # Expira en 24h
            'iat': datetime.utcnow() # Publicado en (Issued at)
        }
        return jwt.encode(payload, SECRET_KEY, algorithm='HS256')