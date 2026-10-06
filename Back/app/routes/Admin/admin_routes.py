from flask import Blueprint, request, jsonify
from app.services.auth_service import role_required
from app.services.event_service import EventService
from app.services.merch_service import MerchService
from app.services.vendor_service import VendorService

admin_bp = Blueprint('admin_bp', __name__)

event_service = EventService()
merch_service = MerchService()
vendor_service = VendorService()

# =====================================================
#                     EVENTOS
# =====================================================

@admin_bp.route('/api/admin/events', methods=['POST', 'OPTIONS'])
def create_event():
    """
    Crear nuevo evento
    ---
    tags:
      - Administración
    summary: Crea un evento en el sistema (Solo Administradores)
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
          required:
            - name
            - date
          properties:
            name:
              type: string
              example: "Festival Rock en el Parque"
            date:
              type: string
              example: "2026-11-15"
            description:
              type: string
              example: "Gran festival de música rock con bandas invitadas"
            location:
              type: string
              example: "Auditorio Municipal"
            image:
              type: string
              example: "https://example.com/portada.jpg"
    responses:
      201:
        description: Evento creado exitosamente
      401:
        description: Token no provisto o inválido
      403:
        description: Permisos insuficientes (requiere rol admin)
      500:
        description: Error interno del servidor
    """
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200
    
    @role_required('admin')
    def handle_post(current_user_id):
        data = request.get_json() or {}
        try:
            new_event = event_service.create_event(data)
            return jsonify(new_event), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    return handle_post()

@admin_bp.route('/api/admin/events/<event_id>', methods=['DELETE', 'OPTIONS'])
def delete_event(event_id):
    """
    Eliminar evento
    ---
    tags:
      - Administración
    summary: Elimina un evento por ID (Solo Administradores)
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
        description: ID del evento a eliminar
    responses:
      200:
        description: Evento eliminado exitosamente
      401:
        description: Token no provisto o inválido
      403:
        description: Permisos insuficientes (requiere rol admin)
      404:
        description: Evento no encontrado
      500:
        description: Error interno del servidor
    """
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200
    
    @role_required('admin')
    def handle_delete(current_user_id):
        try:
            ok = event_service.delete_event(event_id)
            if not ok:
                return jsonify({"error": "Evento no encontrado"}), 404
            return jsonify({"message": "Evento eliminado"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
            
    return handle_delete()

# =====================================================
#                  MERCHANDISING
# =====================================================

@admin_bp.route('/api/admin/merchandise', methods=['POST', 'OPTIONS'])
def create_merch():
    """
    Añadir producto de merchandising
    ---
    tags:
      - Administración
    summary: Agrega un nuevo producto al catálogo (Solo Administradores)
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
          required:
            - name
            - price
          properties:
            name:
              type: string
              example: "Camiseta Tour 2026"
            price:
              type: number
              example: 25.50
            category:
              type: string
              example: "Ropa"
            image:
              type: string
              example: "https://example.com/camiseta.jpg"
    responses:
      201:
        description: Producto creado exitosamente
      401:
        description: Token no provisto o inválido
      403:
        description: Permisos insuficientes (requiere rol admin)
      500:
        description: Error interno del servidor
    """
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200
        
    @role_required('admin')
    def handle_post(current_user_id):
        data = request.get_json() or {}
        try:
            product = merch_service.add_product_to_catalog(
                name=data.get('name'),
                price=data.get('price'),
                category=data.get('category'),
                image=data.get('image')
            )
            return jsonify(product), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return handle_post()

@admin_bp.route('/api/admin/merchandise/<merch_id>', methods=['DELETE', 'OPTIONS'])
def delete_merch(merch_id):
    """
    Eliminar producto de merchandising
    ---
    tags:
      - Administración
    summary: Elimina un producto del catálogo por ID (Solo Administradores)
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Token JWT con formato 'Bearer <token>'
      - name: merch_id
        in: path
        type: string
        required: true
        description: ID del producto a eliminar
    responses:
      200:
        description: Producto eliminado exitosamente
      401:
        description: Token no provisto o inválido
      403:
        description: Permisos insuficientes (requiere rol admin)
      500:
        description: Error interno del servidor
    """
    if request.method == 'OPTIONS':
        return jsonify({"success": True}), 200
    
    @role_required('admin')
    def handle_delete(current_user_id):
        try:
            ok = merch_service.delete_product(merch_id)
            return jsonify({"message": "Eliminado"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    return handle_delete()