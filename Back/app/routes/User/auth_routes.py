from flask import request, jsonify, Blueprint
from app.services.user_service import UserService
from app.services.auth_service import AuthService

auth_bp = Blueprint('auth_bp', __name__)
user_service = UserService()


@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    try:
        # El registro público siempre crea cuentas con rol 'user'.
        # Vendors y admins se crean por seed o por ruta admin interna.
        uid = user_service.register_user(
            data['name'], data['email'], data['password'], role='user'
        )
        return jsonify({"user_id": uid}), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    user = user_service.authenticate_user(data.get('email'), data.get('password'))
    if not user:
        return jsonify({"message": "Credenciales incorrectas"}), 401

    token = AuthService.generate_token(user['id'], user.get('role', 'user'))
    return jsonify({
        "token": token,
        "user": {
            "id": user['id'],
            "name": user['name'],
            "email": user['email'],
            "role": user.get('role', 'user')
        }
    }), 200
