from flask import Blueprint, request, jsonify
from app.services.auth_service import token_required
from app.services.ticket_service import TicketService
from app.services.merch_service import MerchService

purchase_bp = Blueprint('purchase_bp', __name__)
ticket_service = TicketService()
merch_service = MerchService()

@purchase_bp.route('/api/purchase/ticket', methods=['POST'])
@token_required
def buy_ticket(current_user_id):
    data = request.json
    try:
        # Solo enviamos el ticket_price_id, el ID de usuario viene del TOKEN seguro
        result = ticket_service.purchase_ticket(current_user_id, data['ticket_price_id'])
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@purchase_bp.route('/api/purchase/merch', methods=['POST'])
@token_required
def buy_merch(current_user_id):
    data = request.json
    try:
        # data['items'] podría ser una lista si el carrito tiene varios productos
        result = merch_service.purchase_merch(
            user_id=current_user_id, 
            merch_id=data['merch_id'], 
            quantity=data.get('quantity', 1)
        )
        return jsonify(result), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400