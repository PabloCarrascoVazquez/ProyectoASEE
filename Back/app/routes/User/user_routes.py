from flask import Blueprint, request, jsonify
from app.services.auth_service import token_required # Tu decorador
from app.services.ticket_service import TicketService
from app.services.merch_service import MerchService

profile_bp = Blueprint('profile_bp', __name__)
ticket_service = TicketService()
merch_service = MerchService()

@profile_bp.route('/api/user/tickets', methods=['GET'])
@token_required
def get_my_tickets(current_user_id):
    # 'current_user_id' viene inyectado por el decorador desde el token
    tickets = ticket_service.get_user_wallet(current_user_id)
    return jsonify(tickets), 200

@profile_bp.route('/api/user/merch', methods=['GET'])
@token_required
def get_my_merch_orders(current_user_id):
    orders = merch_service.get_user_orders(current_user_id)
    return jsonify(orders), 200