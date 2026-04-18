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
#                    EVENTOS
# =====================================================
@admin_bp.route('/api/admin/events', methods=['POST'])
@role_required('admin')
def create_event(current_user_id):
    data = request.get_json() or {}
    try:
        new_event = event_service.create_event(data)
        return jsonify(new_event), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": f"Error al crear el evento: {str(e)}"}), 500


@admin_bp.route('/api/admin/events/<event_id>', methods=['DELETE'])
@role_required('admin')
def delete_event(current_user_id, event_id):
    try:
        ok = event_service.delete_event(event_id)
        if not ok:
            return jsonify({"error": "Evento no encontrado"}), 404
        return jsonify({"message": "Evento eliminado"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =====================================================
#                 MERCHANDISING
# =====================================================
@admin_bp.route('/api/admin/merchandise', methods=['POST'])
@role_required('admin')
def create_merch(current_user_id):
    data = request.get_json() or {}
    try:
        product = merch_service.add_product_to_catalog(
            name=data.get('name'),
            price=data.get('price'),
            category=data.get('category'),
            image=data.get('image')
        )
        return jsonify(product), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route('/api/admin/merchandise/<merch_id>', methods=['DELETE'])
@role_required('admin')
def delete_merch(current_user_id, merch_id):
    try:
        ok = merch_service.delete_product(merch_id)
        if not ok:
            return jsonify({"error": "Producto no encontrado"}), 404
        return jsonify({"message": "Producto eliminado"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# =====================================================
#              ESPACIOS DE VENDEDORES
# =====================================================
@admin_bp.route('/api/admin/vendor-spaces', methods=['GET'])
@role_required('admin')
def list_spaces(current_user_id):
    try:
        return jsonify(vendor_service.get_all_spaces()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route('/api/admin/vendor-spaces', methods=['POST'])
@role_required('admin')
def create_space(current_user_id):
    data = request.get_json() or {}
    try:
        space = vendor_service.create_space(data)
        return jsonify(space), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_bp.route('/api/admin/vendor-spaces/<space_id>', methods=['DELETE'])
@role_required('admin')
def delete_space(current_user_id, space_id):
    try:
        ok = vendor_service.delete_space(space_id)
        if not ok:
            return jsonify({"error": "Espacio no encontrado"}), 404
        return jsonify({"message": "Espacio eliminado"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
