from flask import request, jsonify, Blueprint
from app.services.user_service import UserService
from app.services.auth_service import AuthService

auth_bp = Blueprint('auth_bp', __name__)
user_service = UserService()


@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    """
    Registro de nuevo usuario
    ---
    tags:
      - Autenticación
    summary: Registra una nueva cuenta de usuario estándar
    parameters:
      - in: body
        name: body
        required: true
        description: Datos de la cuenta a registrar
        schema:
          type: object
          required:
            - name
            - email
            - password
          properties:
            name:
              type: string
              example: Juan Perez
            email:
              type: string
              example: juan@example.com
            password:
              type: string
              format: password
              example: Password123!
    responses:
      201:
        description: Usuario creado exitosamente
        schema:
          type: object
          properties:
            user_id:
              type: string
              example: "60c72b2f9b1d8b2bad123456"
      400:
        description: Error de validación o usuario existente
        schema:
          type: object
          properties:
            error:
              type: string
              example: "El correo electrónico ya está registrado."
    """
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
    """
    Iniciar sesión
    ---
    tags:
      - Autenticación
    summary: Valida credenciales y genera un token JWT
    parameters:
      - in: body
        name: body
        required: true
        description: Credenciales de inicio de sesión
        schema:
          type: object
          required:
            - email
            - password
          properties:
            email:
              type: string
              example: juan@example.com
            password:
              type: string
              format: password
              example: Password123!
    responses:
      200:
        description: Autenticación exitosa
        schema:
          type: object
          properties:
            token:
              type: string
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            user:
              type: object
              properties:
                id:
                  type: string
                  example: "60c72b2f9b1d8b2bad123456"
                name:
                  type: string
                  example: Juan Perez
                email:
                  type: string
                  example: juan@example.com
                role:
                  type: string
                  example: user
      401:
        description: Credenciales incorrectas
        schema:
          type: object
          properties:
            message:
              type: string
              example: "Credenciales incorrectas"
    """
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