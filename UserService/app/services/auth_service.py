import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify

from app.core.config import settings
from app.dtos.requests import UserLoginRequest
from app.dtos.responses import TokenResponse, UserProfileResponse

SECRET_KEY = settings.SECRET_KEY

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
        data = jwt.decode(token, SECRET_KEY, algorithms=[settings.ALGORITHM])
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

        current_user_id = data.get('sub') or data.get('user_id')
        return f(current_user_id, *args, **kwargs)

    return decorated


def role_required(*allowed_roles):
    """
    Decorador que exige que el usuario tenga alguno de los roles indicados.
    Inyecta current_user_id en la función.
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

            current_user_id = data.get('sub') or data.get('user_id')
            return f(current_user_id, *args, **kwargs)

        return decorated
    return decorator


class AuthService:
    def __init__(self, user_dao=None):
        self.user_dao = user_dao

    @staticmethod
    def hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    @staticmethod
    def check_password(password: str, hashed_password: str) -> bool:
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password)

    @staticmethod
    def generate_token(user_id: str, role: str) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            'sub': str(user_id),
            'user_id': str(user_id),
            'role': role,
            'exp': now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
            'iat': now
        }
        return jwt.encode(payload, SECRET_KEY, algorithm=settings.ALGORITHM)

    def login(self, request: UserLoginRequest) -> TokenResponse:
        """Autentica un usuario y retorna su token y perfil."""
        if not self.user_dao:
            raise ValueError("DAO_NOT_CONFIGURED")

        if not request.email or not request.password:
            raise ValueError("Credenciales incorrectas")

        user_row = self.user_dao.get_by_email(request.email)
        if not user_row:
            raise ValueError("Credenciales incorrectas")

        password_hash = user_row.get("password_hash")
        if not password_hash or not self.check_password(request.password, password_hash):
            raise ValueError("Credenciales incorrectas")

        user_profile = UserProfileResponse(
            id=str(user_row["id"]),
            name=user_row["name"],
            email=user_row["email"],
            rol=user_row.get("rol", user_row.get("role", "client")),
            avatar=user_row.get("avatar"),
        )
        token = self.generate_token(user_profile.id, user_profile.rol)
        return TokenResponse(access_token=token, user=user_profile, token_type="bearer")
