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
    """
    Compra de entrada para evento
    ---
    tags:
      - Compras
    summary: Procesa la compra de una entrada para el usuario autenticado
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Token JWT (formato 'Bearer <token>')
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - ticket_price_id
          properties:
            ticket_price_id:
              type: string
              example: "ticket_vip_01"
    responses:
      201:
        description: Compra realizada exitosamente
        schema:
          type: object
          properties:
            id:
              type: string
              example: "order_67890"
            status:
              type: string
              example: "confirmed"
      400:
        description: Falta el campo ticket_price_id o datos inválidos
      401:
        description: Token inválido o no proporcionado
      500:
        description: Error interno del servidor
    """
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
    """
    Compra de merchandising
    ---
    tags:
      - Compras
    summary: Procesa la compra de un producto de merchandising
    parameters:
      - name: Authorization
        in: header
        type: string
        required: true
        description: Token JWT (formato 'Bearer <token>')
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - merch_id
          properties:
            merch_id:
              type: string
              example: "camiseta_oficial_talla_l"
            quantity:
              type: integer
              default: 1
              example: 2
    responses:
      201:
        description: Compra procesada con éxito
      400:
        description: Error al procesar la compra (stock insuficiente o parámetro faltante)
      401:
        description: Token inválido o no proporcionado
    """
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