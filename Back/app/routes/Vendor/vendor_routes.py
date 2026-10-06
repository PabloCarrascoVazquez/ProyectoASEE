from flask import Blueprint, request, jsonify
from app.services.auth_service import role_required
from app.services.user_service import UserService
from app.services.vendor_service import VendorService

vendor_bp = Blueprint('vendor_bp', __name__)
user_service = UserService()
vendor_service = VendorService()


# =====================================================
#                 PERFIL DEL VENDEDOR
# =====================================================
@vendor_bp.route('/api/vendor/profile', methods=['GET'])
@role_required('vendor', 'admin')
def get_profile(current_user_id):
    """
    Obtener perfil de vendedor
    ---
    tags:
      - Vendedores
    summary: Retorna la información de perfil del vendedor o admin autenticado
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Token JWT con formato 'Bearer <token>'
    responses:
      200:
        description: Perfil obtenido exitosamente
        schema:
          type: object
          properties:
            id:
              type: string
              example: "usr_vendor_01"
            name:
              type: string
              example: "Food Truck Delights"
            email:
              type: string
              example: "vendor@foodtruck.com"
            role:
              type: string
              example: "vendor"
      401:
        description: Token no provisto o inválido
      403:
        description: Permisos insuficientes (requiere rol vendor o admin)
      404:
        description: Vendedor no encontrado
    """
    profile = user_service.get_user_profile(current_user_id)
    if not profile:
        return jsonify({"error": "Vendedor no encontrado"}), 404
    return jsonify(profile), 200


@vendor_bp.route('/api/vendor/profile', methods=['PUT'])
@role_required('vendor', 'admin')
def update_profile(current_user_id):
    """
    Actualizar perfil de vendedor
    ---
    tags:
      - Vendedores
    summary: Modifica los datos del perfil del vendedor
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Token JWT con formato 'Bearer <token>'
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            name:
              type: string
              example: "Food Truck Delights Updated"
            phone:
              type: string
              example: "+34600123456"
            description:
              type: string
              example: "Venta de comida callejera gourmet y bebidas artesanales"
    responses:
      200:
        description: Perfil actualizado correctamente
      400:
        description: Error de validación o no se pudo actualizar
      401:
        description: Token no provisto o inválido
      403:
        description: Permisos insuficientes (requiere rol vendor o admin)
      500:
        description: Error interno del servidor
    """
    data = request.get_json() or {}
    try:
        ok = user_service.update_profile(current_user_id, data)
        if not ok:
            return jsonify({"error": "No se pudo actualizar el perfil"}), 400
        return jsonify(user_service.get_user_profile(current_user_id)), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =====================================================
#               ESPACIOS DISPONIBLES
# =====================================================
@vendor_bp.route('/api/vendor/spaces', methods=['GET'])
@role_required('vendor', 'admin')
def list_available_spaces(current_user_id):
    """
    Listar todos los espacios
    ---
    tags:
      - Vendedores
    summary: Retorna el catálogo completo de puestos del sistema
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Token JWT con formato 'Bearer <token>'
    responses:
      200:
        description: Lista de espacios obtenida correctamente
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
                example: "sp_101"
              name:
                type: string
                example: "Puesto Zona A-01"
              status:
                type: string
                example: "available"
              price:
                type: number
                example: 150.0
      401:
        description: Token no provisto o inválido
      403:
        description: Permisos insuficientes
      500:
        description: Error interno del servidor
    """
    try:
        return jsonify(vendor_service.get_all_spaces()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@vendor_bp.route('/api/vendor/spaces/event/<event_id>', methods=['GET'])
@role_required('vendor', 'admin')
def list_spaces_for_event(current_user_id, event_id):
    """
    Listar espacios disponibles para un evento
    ---
    tags:
      - Vendedores
    summary: Retorna los puestos disponibles asignados a un evento específico
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Token JWT con formato 'Bearer <token>'
      - name: event_id
        in: path
        type: string
        required: true
        description: Identificador del evento
    responses:
      200:
        description: Lista de espacios disponibles para el evento
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
                example: "sp_205"
              name:
                type: string
                example: "Carpa Gastronomía 2"
              event_id:
                type: string
                example: "ev_789"
              is_available:
                type: boolean
                example: true
      401:
        description: Token no provisto o inválido
      403:
        description: Permisos insuficientes
      404:
        description: Evento no encontrado o sin puestos asociados
      500:
        description: Error interno del servidor
    """
    try:
        return jsonify(vendor_service.get_available_spaces_for_event(event_id)), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@vendor_bp.route('/api/vendor/spaces/<space_id>/reserve', methods=['POST'])
@role_required('vendor')
def reserve_space(current_user_id, space_id):
    """
    Reservar un espacio
    ---
    tags:
      - Vendedores
    summary: Permite a un vendedor reservar un puesto determinado
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Token JWT con formato 'Bearer <token>'
      - name: space_id
        in: path
        type: string
        required: true
        description: Identificador del espacio a reservar
    responses:
      200:
        description: Puesto reservado exitosamente
        schema:
          type: object
          properties:
            id:
              type: string
              example: "sp_205"
            status:
              type: string
              example: "reserved"
            reserved_by:
              type: string
              example: "usr_vendor_01"
      400:
        description: El espacio ya está ocupado o no se puede reservar
      401:
        description: Token no provisto o inválido
      403:
        description: Permisos insuficientes (requiere rol vendor)
      500:
        description: Error interno del servidor
    """
    try:
        space = vendor_service.reserve_space(space_id)
        return jsonify(space), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500