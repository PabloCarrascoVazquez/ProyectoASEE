import uuid
from app.daos.factories import DAOFactory

class MerchService:
    def __init__(self):
        self.merch_dao = DAOFactory.get_merch_dao()

    def get_full_catalog(self):
        """
        Retorna todo el catálogo. Aquí podríamos añadir lógica de ordenación
        o filtrado por stock en el futuro.
        """
        items = self.merch_dao.get_all()
        for item in items:
            item['formatted_price'] = f"{item['price']}€"
        return items

    def get_products_by_category(self, category):
        """
        Filtra productos. Útil para las pestañas de 'Ropa', 'Accesorios', etc.
        """
        if not category:
            return self.get_full_catalog()
            
        return self.merch_dao.get_by_category(category)

    def add_product_to_catalog(self, name, price, category, image=None):
        """
        Lógica para que un administrador añada productos.
        """
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