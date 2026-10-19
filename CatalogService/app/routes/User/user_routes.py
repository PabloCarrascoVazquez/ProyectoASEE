from flask import Blueprint, request, jsonify
from app.services.auth_service import token_required 
from app.services.ticket_service import TicketService
from app.services.merch_service import MerchService

profile_bp = Blueprint('profile_bp', __name__)
ticket_service = TicketService()
merch_service = MerchService()

@profile_bp.route('/api/user/tickets', methods=['GET'])
@token_required
def get_my_tickets(current_user_id):
    """
    Obtener entradas del usuario autenticado
    ---
    tags:
      - Perfil
    summary: Retorna la lista de tickets adquiridos por el usuario actual
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Token JWT con formato 'Bearer <token>'
    responses:
      200:
        description: Cartera de tickets obtenida correctamente
        schema:
          type: array
          items:
            type: object
            properties:
              id:
                type: string
                example: "ticket_12345"
              event_id:
                type: string
                example: "event_987"
              price:
                type: number
                example: 45.0
      401:
        description: Token no provisto o inválido
    """
    # 'current_user_id' viene inyectado por el decorador desde el token
    tickets = ticket_service.get_user_wallet(current_user_id)
    print(f"DEBUG: ID de usuario actual: {current_user_id}")
    print(f"DEBUG: Tickets encontrados: {tickets}")
    return jsonify(tickets), 200

@profile_bp.route('/api/user/merch', methods=['GET'])
@token_required
def get_my_merch_orders(current_user_id):
    """
    Obtener pedidos de merchandising del usuario autenticado
    ---
    tags:
      - Perfil
    summary: Retorna el historial de compras de merchandising del usuario actual
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Token JWT con formato 'Bearer <token>'
    responses:
      200:
        description: Historial de pedidos obtenido correctamente
        schema:
          type: array
          items:
            type: object
            properties:
              order_id:
                type: string
                example: "order_555"
              merch_id:
                type: string
                example: "camiseta_01"
              quantity:
                type: integer
                example: 2
      401:
        description: Token no provisto o inválido
    """
    orders = merch_service.get_user_orders(current_user_id)
    return jsonify(orders), 200