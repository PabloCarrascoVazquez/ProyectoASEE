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