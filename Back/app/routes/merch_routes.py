from flask import Blueprint, jsonify
from app.services.merch_service import MerchService

merch_bp = Blueprint('merch_bp', __name__)
service = MerchService()

@merch_bp.route('/api/merchandise', methods=['GET'])
def get_all_merch():
    """Retorna la lista de productos formateada para MerchandiseItem interface"""
    products = service.get_full_catalog()
    
    # Mapeo manual para asegurar compatibilidad con el Front
    formatted_list = []
    for p in products:
        formatted_list.append({
            "id": str(p.get('id')),
            "name": p.get('name'),
            "price": float(p.get('price', 0)),
            "image": p.get('image_url') or p.get('image'), # Adaptamos el nombre del campo
            "category": p.get('category')
        })
        
    return jsonify(formatted_list), 200

@merch_bp.route('/api/merchandise/<id>', methods=['GET'])
def get_merch_by_id(id):
    """Retorna un único producto formateado para MerchandiseItem"""
    p = service.get_by_id(id)
    
    if not p:
        return jsonify({"status": "error", "message": "Producto no encontrado"}), 404
    
    # Transformamos el resultado individual
    product_data = {
        "id": str(p.get('id')),
        "name": p.get('name'),
        "price": float(p.get('price', 0)),
        "image": p.get('image_url') or p.get('image'),
        "category": p.get('category')
    }
    
    # Tu interfaz de ejemplo para ID específico pedía este formato: {status: success, data: [...]}
    return jsonify({
        "status": "success",
        "data": [product_data]
    }), 200