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
    data = request.get_json()
    
    # Usamos .get() para que si no existe devuelva None y no explote
    t_price_id = data.get('ticket_price_id')
    
    if not t_price_id:
        return jsonify({"error": "Falta el campo ticket_price_id"}), 400

    try:
        # Llamamos al servicio (tu TicketService actual está perfecto)
        result = ticket_service.purchase_ticket(current_user_id, t_price_id)
        
        # Como tu servicio devuelve: return purchase_data, 201
        # 'result' es una tupla: (diccionario, 201)
        return jsonify(result[0]), result[1]
        
    except Exception as e:
        # Imprimimos el error real en la consola para verlo
        import traceback
        traceback.print_exc() 
        return jsonify({"error": "Internal Server Error"}), 500

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