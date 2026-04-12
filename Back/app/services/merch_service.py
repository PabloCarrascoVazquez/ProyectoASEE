import uuid
from datetime import datetime
from app.daos.factories import DAOFactory

class MerchService:
    def __init__(self):
        # DAOs necesarios para el catálogo y las compras
        self.merch_dao = DAOFactory.get_merch_dao()
        self.user_merch_dao = DAOFactory.get_user_merch_dao()
        self.user_dao = DAOFactory.get_user_dao()

    def get_full_catalog(self):
        """Retorna todo el catálogo con precio formateado."""
        items = self.merch_dao.get_all()
        # Aseguramos que los objetos sean diccionarios mutables
        processed_items = []
        for item in items:
            i = dict(item)
            i['formatted_price'] = f"{i['price']}€"
            processed_items.append(i)
        return processed_items

    def get_products_by_category(self, category):
        """Filtra productos por categoría."""
        if not category or category.lower() == 'all':
            return self.get_full_catalog()
            
        items = self.merch_dao.get_by_category(category)
        return [dict(item) for item in items]

    def purchase_merch(self, user_id, merch_id, quantity=1):
        """
        PROCESO DE COMPRA DE MERCH: 
        Valida usuario, producto y registra la transacción.
        """
        # 1. Validar Usuario
        user = self.user_dao.get_by_id(user_id)
        if not user:
            raise ValueError("Usuario no encontrado para realizar la compra.")

        # 2. Validar Producto
        product = self.merch_dao.get_by_id(merch_id)
        if not product:
            raise ValueError("El artículo de merchandising no existe.")

        # 3. Preparar datos de la transacción
        total_price = float(product['price']) * quantity
        
        purchase_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "merch_id": merch_id,
            "quantity": quantity,
            "total_price": total_price,
            "status": "PENDING", # Estado inicial del envío
            "purchase_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        try:
            # 4. Persistir en la tabla de compras (user_merch_dao)
            self.user_merch_dao.create(purchase_data)
            return purchase_data
        except Exception as e:
            raise Exception(f"Error al procesar la compra de merch: {str(e)}")

    def get_user_orders(self, user_id):
        """
        Retorna el historial de compras de merch de un usuario 
        (lo que vería en su sección 'Mis Pedidos').
        """
        return self.user_merch_dao.get_by_user_id(user_id)

    def add_product_to_catalog(self, name, price, category, image=None):
        """Lógica administrativa para añadir productos."""
        if price <= 0:
            raise ValueError("El precio debe ser mayor que cero.")

        product_data = {
            "id": str(uuid.uuid4()),
            "name": name,
            "price": float(price),
            "category": category,
            "image": image if image else "default_product.png"
        }

        try:
            self.merch_dao.create(product_data)
            return product_data
        except Exception as e:
            raise Exception(f"Error al añadir producto al catálogo: {str(e)}")