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
    profile = user_service.get_user_profile(current_user_id)
    if not profile:
        return jsonify({"error": "Vendedor no encontrado"}), 404
    return jsonify(profile), 200


@vendor_bp.route('/api/vendor/profile', methods=['PUT'])
@role_required('vendor', 'admin')
def update_profile(current_user_id):
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
    """Todos los puestos del sistema (el front decidirá filtrar por disponibles)."""
    try:
        return jsonify(vendor_service.get_all_spaces()), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@vendor_bp.route('/api/vendor/spaces/event/<event_id>', methods=['GET'])
@role_required('vendor', 'admin')
def list_spaces_for_event(current_user_id, event_id):
    try:
        return jsonify(vendor_service.get_available_spaces_for_event(event_id)), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@vendor_bp.route('/api/vendor/spaces/<space_id>/reserve', methods=['POST'])
@role_required('vendor')
def reserve_space(current_user_id, space_id):
    try:
        space = vendor_service.reserve_space(space_id)
        return jsonify(space), 200
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500
