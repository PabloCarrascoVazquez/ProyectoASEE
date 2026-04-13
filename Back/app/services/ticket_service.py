import uuid
from datetime import datetime
from app.daos.factories import DAOFactory

class TicketService:
    def __init__(self):
        self.ticket_price_dao = DAOFactory.get_ticket_price_dao()
        self.user_ticket_dao = DAOFactory.get_user_ticket_dao()
        self.user_dao = DAOFactory.get_user_dao()
        self.event_dao = DAOFactory.get_event_dao()

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
        # 1. Buscamos el precio
        price_info = self.ticket_price_dao.get_by_id(ticket_price_id)
        
        # DEBUG: Vamos a ver qué devuelve exactamente el DAO
        print(f"DEBUG: price_info es de tipo {type(price_info)}: {price_info}")

        if not price_info:
            return {"error": "Precio no encontrado"}, 404

        # 2. Intentamos sacar el event_id de forma segura
        # Si price_info es un objeto Row o Dict, esto funcionará:
        try:
            e_id = price_info['event_id']
            p_type = price_info['type']
            p_price = price_info['price']
        except (KeyError, TypeError):
            # Si falla, es que tu DAO devuelve una tupla o el mapeo es distinto
            print("⚠️ El objeto price_info no tiene las claves esperadas. Revisando DAO...")
            # Como último recurso, intentamos acceso por índice si es tupla
            e_id = price_info[1] # Asumiendo que event_id es la segunda columna
            p_type = price_info[2]
            p_price = price_info[3]

        # 3. Buscamos el evento
        event_info = self.event_dao.get_by_id(e_id)
        if not event_info:
            return {"error": "Evento no encontrado"}, 404

        # 4. Mapeamos los datos
        purchase_data = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "ticket_price_id": ticket_price_id,
            "event_name": event_info['name'],
            "event_date": event_info['date'],
            "type": p_type,
            "price": p_price,
            "qr_code": f"SUB-{str(uuid.uuid4())[:8].upper()}",
            "image_url": event_info['image'],
            "purchase_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }

        self.user_ticket_dao.create(purchase_data)
        return purchase_data, 201

    def get_user_wallet(self, user_id):
        """
        Retorna todas las entradas que ha comprado un usuario con info del evento.
        """
        return self.user_ticket_dao.get_by_user_id(user_id)