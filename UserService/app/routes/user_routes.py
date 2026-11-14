from functools import wraps
import jwt
from flask import Blueprint, request, jsonify

# Factories y Servicios
from app.daos.factories import DAOFactory
from app.services.user_service import UserService
from app.services.auth_service import AuthService
from app.core.config import settings

# DTOs
from app.dtos.requests import UserRegisterRequest, UserLoginRequest, UserUpdateProfileRequest


user_bp = Blueprint("user_routes", __name__)

# ==========================================
# MIDDLEWARE / DECORADOR DE AUTENTICACIÓN
# ==========================================

def token_required(f):
    """Verifica que la petición contenga un token JWT válido en el header Authorization."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({
                "codigo": 401,
                "mensaje": "Acceso no autorizado",
                "detalle": "Falta el token Bearer en la cabecera."
            }), 401

        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            current_user_id = payload.get("sub") or payload.get("user_id")
        except jwt.ExpiredSignatureError:
            return jsonify({"codigo": 401, "mensaje": "Acceso no autorizado", "detalle": "Token expirado."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"codigo": 401, "mensaje": "Acceso no autorizado", "detalle": "Token inválido."}), 401

        # Pasamos el ID del usuario extraído del token a la ruta
        return f(current_user_id, *args, **kwargs)

    return decorated


# ==========================================
# ENDPOINTS DE AUTENTICACIÓN Y PERFIL
# ==========================================

@user_bp.route("/auth/register", methods=["POST"])
def register():
    """Registra un nuevo usuario en el sistema."""
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": "JSON vacío o inválido."}), 400

        req_dto = UserRegisterRequest.from_dict(data)
        
        # Instanciamos el servicio inyectando el DAO
        user_service = UserService(DAOFactory.get_user_dao())
        
        # Delegamos la lógica al servicio
        response_dto = user_service.register_user(req_dto)
        
        return jsonify(response_dto.to_dict()), 201

    except ValueError as ve:
        if str(ve) == "EMAIL_ALREADY_EXISTS":
            return jsonify({"codigo": 409, "mensaje": "Conflicto", "detalle": "El email ya está registrado."}), 409
        return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": str(ve)}), 400
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500


@user_bp.route("/auth/login", methods=["POST"])
def login():
    """Autentica a un usuario y devuelve un JWT."""
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": "JSON vacío o inválido."}), 400

        req_dto = UserLoginRequest.from_dict(data)
        
        auth_service = AuthService(DAOFactory.get_user_dao())
        token_response = auth_service.login(req_dto)
        
        return jsonify(token_response.to_dict()), 200

    except ValueError as ve:
        if str(ve) == "Credenciales incorrectas":
            return jsonify({"codigo": 401, "mensaje": "Acceso no autorizado", "detalle": str(ve)}), 401
        return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": str(ve)}), 400
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500


@user_bp.route("/auth/perfil", methods=["GET"])
@user_bp.route("/auth/me", methods=["GET"])
@token_required
def get_profile(current_user_id: str):
    """Devuelve los datos del perfil del usuario logueado."""
    try:
        user_service = UserService(DAOFactory.get_user_dao())
        profile_response = user_service.get_profile(current_user_id)
        
        return jsonify(profile_response.to_dict()), 200

    except ValueError as ve:
        if str(ve) == "USER_NOT_FOUND":
            return jsonify({"codigo": 404, "mensaje": "No encontrado", "detalle": "El usuario no existe."}), 404
        return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": str(ve)}), 400
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500


@user_bp.route("/auth/perfil", methods=["PUT"])
@token_required
def update_profile(current_user_id: str):
    """Actualiza la información del perfil del usuario logueado."""
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": "JSON vacío o inválido."}), 400

        req_dto = UserUpdateProfileRequest.from_dict(data)
        user_service = UserService(DAOFactory.get_user_dao())
        
        updated_profile = user_service.update_profile(current_user_id, req_dto)
        
        return jsonify(updated_profile.to_dict()), 200

    except ValueError as ve:
        if str(ve) == "USER_NOT_FOUND":
            return jsonify({"codigo": 404, "mensaje": "No encontrado", "detalle": "El usuario no existe."}), 404
        return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": str(ve)}), 400
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500



@user_bp.route("/auth/health", methods=["GET"])
def health_check():
    return jsonify({"status": "UP", "service": "UserService"}), 200