import jwt
import bcrypt
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify
from dotenv import load_dotenv


load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-me')


def _extract_token_payload():
    """
    Extrae el token del header Authorization y lo decodifica.
    Retorna (payload, None) si OK o (None, (mensaje, código)) en caso de error.
    """
    token = None
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        parts = auth_header.split(" ")
        if len(parts) > 1:
            token = parts[1]

    if not token:
        return None, ({'message': 'Token inexistente'}, 401)

    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return data, None
    except jwt.ExpiredSignatureError:
        return None, ({'message': 'El token ha expirado'}, 401)
    except jwt.InvalidTokenError:
        return None, ({'message': 'Token inválido'}, 401)
    except Exception as e:
        return None, ({'message': 'Error en autenticación', 'error': str(e)}, 401)


def token_required(f):
    """Decorador básico: exige un JWT válido e inyecta current_user_id."""
    @wraps(f)
    def decorated(*args, **kwargs):
        data, err = _extract_token_payload()
        if err:
            body, code = err
            return jsonify(body), code

        current_user_id = data['user_id']
        return f(current_user_id, *args, **kwargs)

    return decorated


def role_required(*allowed_roles):
    """
    Decorador que exige que el usuario tenga alguno de los roles indicados.
    Inyecta current_user_id en la función.

    Uso:
        @role_required('admin')
        def ruta_admin(current_user_id):
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            data, err = _extract_token_payload()
            if err:
                body, code = err
                return jsonify(body), code

            role = data.get('role', 'user')
            if role not in allowed_roles:
                return jsonify({
                    'message': 'No tienes permisos para realizar esta acción',
                    'required_roles': list(allowed_roles),
                    'your_role': role
                }), 403

            current_user_id = data['user_id']
            return f(current_user_id, *args, **kwargs)

        return decorated
    return decorator


class AuthService:
    @staticmethod
    def hash_password(password):
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def check_password(password, hashed_password):
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password)

    @staticmethod
    def generate_token(user_id, role):
        payload = {
            'user_id': str(user_id),
            'role': role,
            'exp': datetime.utcnow() + timedelta(days=1),
            'iat': datetime.utcnow()
        }
        return jwt.encode(payload, SECRET_KEY, algorithm='HS256')
