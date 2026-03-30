import uuid
from datetime import datetime
from app.daos.factories import DAOFactory

class TicketService:
    def __init__(self):
        self.ticket_price_dao = DAOFactory.get_ticket_price_dao()
        self.user_ticket_dao = DAOFactory.get_user_ticket_dao()
        self.user_dao = DAOFactory.get_user_dao()

    def get_prices_for_event(self, event_id):
        """
        Retorna los tipos de entrada disponibles para un evento (General, VIP, etc.)
        """
        prices = self.ticket_price_dao.get_by_event_id(event_id)
        for p in prices:
            if isinstance(p.get('features'), str):
                import json
                try:
                    p['features_list'] = json.loads(p['features'])
                except:
                    p['features_list'] = []
        return prices

    def purchase_ticket(self, user_id, ticket_price_id):
        """
        PROCESO DE COMPRA: El corazón del negocio.
        """
        user = self.user_dao.get_by_id(user_id)
        if not user:
            raise ValueError("Usuario no encontrado para realizar la compra.")

        ticket_type = self.ticket_price_dao.get_by_id(ticket_price_id)
        if not ticket_type:
            raise ValueError("El tipo de entrada seleccionado no existe.")

        purchase_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "ticket_price_id": ticket_price_id,
            "status": "ACTIVE",
            "purchase_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        try:
            self.user_ticket_dao.create(purchase_data)
            return purchase_data
        except Exception as e:
            raise Exception(f"Error al procesar la transacción: {str(e)}")

    def get_user_wallet(self, user_id):
        """
        Retorna todas las entradas que ha comprado un usuario con info del evento.
        """
        return self.user_ticket_dao.get_by_user_id(user_id)