from functools import wraps
import jwt
from flask import Blueprint, request, jsonify

# Factories y Servicios
from app.daos.factories import DAOFactory
from app.services.catalog_service import CatalogService
from app.core.config import settings

# DTOs
from app.dtos.requests import BloqueoCupoRequest, AlquilerRequest, ArtistaFavoritoRequest

catalog_bp = Blueprint("catalog_routes", __name__, url_prefix="/api")

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

def admin_required(f):
    """Verifica que el token JWT sea válido y que el usuario tenga rol de administrador."""
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
            rol = payload.get("rol") or payload.get("role")
            
            if rol != "admin":
                return jsonify({
                    "codigo": 403,
                    "mensaje": "Acceso prohibido",
                    "detalle": "Se requieren permisos de administrador."
                }), 403
        except jwt.ExpiredSignatureError:
            return jsonify({"codigo": 401, "mensaje": "Acceso no autorizado", "detalle": "Token expirado."}), 401
        except jwt.InvalidTokenError:
            return jsonify({"codigo": 401, "mensaje": "Acceso no autorizado", "detalle": "Token inválido."}), 401

        return f(current_user_id, *args, **kwargs)

    return decorated

# ==========================================
# ENDPOINTS DE LECTURA PÚBLICA
# ==========================================

@catalog_bp.route("/health", methods=["GET"])
def health_check():
    """Comprueba la salud del microservicio."""
    return jsonify({"status": "UP", "service": "CatalogService"}), 200

@catalog_bp.route("/festivales", methods=["GET"])
def get_festivales():
    """Listar todos los festivales."""
    try:
        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        response_list = catalog_service.get_all_festivales()
        return jsonify([resp.to_dict() for resp in response_list]), 200
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

@catalog_bp.route("/festivales/<id_festival>/espacios", methods=["GET"])
def get_espacios(id_festival: str):
    """Listar parcelas y mapa de un festival."""
    try:
        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        response_list = catalog_service.get_espacios(id_festival)
        return jsonify([resp.to_dict() for resp in response_list]), 200
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

@catalog_bp.route("/festivales/<id_festival>/entradas", methods=["GET"])
def get_entradas(id_festival: str):
    """Consultar tarifas y disponibilidad de entradas."""
    try:
        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        response_list = catalog_service.get_entradas(id_festival)
        return jsonify([resp.to_dict() for resp in response_list]), 200
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

# ==========================================
# ENDPOINTS PROTEGIDOS (REQUERIDOS POR JWT)
# ==========================================
@catalog_bp.route("/festivales/<id_festival>/entradas/bloquear", methods=["POST"])
@token_required
def bloquear_entradas(current_user_id: str, id_festival: str):
    """Bloqueo temporal de cupo (Llamada desde el Servicio de Compras)."""
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": "JSON vacío o inválido."}), 400

        req_dto = BloqueoCupoRequest.from_dict(data)
        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        response_dto = catalog_service.bloquear_cupo(id_festival, req_dto)
        
        return jsonify(response_dto.to_dict()), 200
    except ValueError as ve:
        if str(ve) == "NO_STOCK":
            return jsonify({"codigo": 409, "mensaje": "Conflicto", "detalle": "Aforo agotado para este tipo de entrada."}), 409
        return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": str(ve)}), 400
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

@catalog_bp.route("/festivales/<id_festival>/entradas/liberar", methods=["POST"])
@token_required
def liberar_entradas(current_user_id: str, id_festival: str):
    """Liberar cupo bloqueado tras fallo de pago."""
    try:
        data = request.get_json(silent=True)
        req_dto = BloqueoCupoRequest.from_dict(data)
        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        catalog_service.liberar_cupo(id_festival, req_dto)
        
        return jsonify({"mensaje": "Cupo liberado correctamente."}), 200
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

@catalog_bp.route("/espacios/<id_espacio>/alquileres", methods=["POST"])
@token_required
def solicitar_alquiler(current_user_id: str, id_espacio: str):
    """Solicitar alquiler de parcela por un proveedor."""
    try:
        data = request.get_json(silent=True)
        req_dto = AlquilerRequest.from_dict(data)
        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        response_dto = catalog_service.crear_alquiler(id_espacio, req_dto)
        
        return jsonify(response_dto.to_dict()), 201
    except ValueError as ve:
        if str(ve) == "ESPACIO_NO_DISPONIBLE":
            return jsonify({"codigo": 409, "mensaje": "Conflicto", "detalle": "La parcela ya se encuentra alquilada o reservada."}), 409
        if str(ve) == "ESPACIO_NO_ENCONTRADO":
            return jsonify({"codigo": 404, "mensaje": "No encontrado", "detalle": "El recurso solicitado no existe."}), 404
        return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": str(ve)}), 400
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

@catalog_bp.route("/espacios/<id_espacio>/alquileres/cancelar", methods=["POST"])
@token_required
def cancelar_alquiler_espacio(current_user_id: str, id_espacio: str):
    """Cancelar alquiler de parcela y devolver el espacio a estado disponible."""
    try:
        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        catalog_service.cancelar_alquiler(id_espacio)
        return jsonify({"mensaje": "Alquiler cancelado y espacio liberado correctamente.", "estado_devolucion": "Cancelado"}), 200
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

@catalog_bp.route("/artistas-favoritos", methods=["POST"])
@token_required
def guardar_artista_favorito(current_user_id: str):
    """Guardar artista en la lista de favoritos."""
    try:
        data = request.get_json(silent=True)
        req_dto = ArtistaFavoritoRequest.from_dict(data)
        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        response_dto = catalog_service.guardar_favorito(current_user_id, req_dto)
        
        return jsonify(response_dto.to_dict()), 201
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

# ==========================================
# ENDPOINTS DE ADMINISTRACIÓN (SOLO ADMIN)
# ==========================================
@catalog_bp.route("/festivales", methods=["POST"])
@admin_required
def crear_festival(current_user_id: str):
    """Crear un nuevo festival (Solo Administradores)."""
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": "JSON vacío o inválido."}), 400

        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        response_dto = catalog_service.crear_festival(data)
        
        return jsonify(response_dto.to_dict() if hasattr(response_dto, "to_dict") else response_dto), 201
    except ValueError as ve:
        return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": str(ve)}), 400
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

@catalog_bp.route("/artistas", methods=["POST"])
@admin_required
def crear_artista(current_user_id: str):
    """Añadir un nuevo artista al catálogo (Solo Administradores)."""
    try:
        data = request.get_json(silent=True)
        if not data:
            return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": "JSON vacío o inválido."}), 400

        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        response_dto = catalog_service.crear_artista(data)
        
        return jsonify(response_dto.to_dict() if hasattr(response_dto, "to_dict") else response_dto), 201
    except ValueError as ve:
        return jsonify({"codigo": 400, "mensaje": "Petición incorrecta", "detalle": str(ve)}), 400
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

@catalog_bp.route("/festivales/<id_festival>/entradas", methods=["POST"])
@admin_required
def crear_entradas(current_user_id: str, id_festival: str):
    """Añadir tipos de entradas a un festival (Solo Admin)."""
    try:
        data = request.get_json(silent=True)
        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        catalog_service.crear_entradas(id_festival, data)
        return jsonify({"mensaje": "Entradas creadas correctamente."}), 201
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

@catalog_bp.route("/festivales/<id_festival>/espacios", methods=["POST"])
@admin_required
def crear_espacio(current_user_id: str, id_festival: str):
    """Añadir una parcela/espacio a un festival (Solo Admin)."""
    try:
        data = request.get_json(silent=True)
        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        catalog_service.crear_espacio(id_festival, data)
        return jsonify({"mensaje": "Espacio creado correctamente."}), 201
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

@catalog_bp.route("/festivales/<id_festival>", methods=["PUT"])
@admin_required
def actualizar_festival(current_user_id: str, id_festival: str):
    """Modificar un festival existente (Solo Admin)."""
    try:
        data = request.get_json(silent=True)
        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        catalog_service.actualizar_festival(id_festival, data)
        return jsonify({"mensaje": "Festival actualizado correctamente."}), 200
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500

@catalog_bp.route("/festivales/<id_festival>", methods=["DELETE"])
@admin_required
def borrar_festival(current_user_id: str, id_festival: str):
    """Eliminar un festival (Solo Admin)."""
    try:
        catalog_service = CatalogService(DAOFactory.get_catalog_dao())
        catalog_service.borrar_festival(id_festival)
        return jsonify({"mensaje": "Festival eliminado correctamente."}), 200
    except Exception as e:
        return jsonify({"codigo": 500, "mensaje": "Error interno", "detalle": str(e)}), 500