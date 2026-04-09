import uuid
import json # Importante para parsear las listas de la DB
from datetime import datetime
from app.daos.factories import DAOFactory

class EventService:
    def __init__(self):
        self.event_dao = DAOFactory.get_event_dao()
        self.artist_dao = DAOFactory.get_artist_dao()
        # Cambiamos el nombre aquí para que coincida con tu Factory
        self.ticket_dao = DAOFactory.get_ticket_price_dao()

    def get_upcoming_events(self):
        events = self.event_dao.get_all()
        processed_events = []
        
        for event in events:
            # Convertir de objeto Row a dict para poder modificarlo
            e = dict(event)
            event_id = e['id']

            # 1. Obtener artistas y tickets para cada evento
            e['artists'] = self.artist_dao.get_by_event_id(event_id)
            e['ticketPrices'] = self.ticket_dao.get_by_event_id(event_id)

            # 2. Formatear fecha
            if e.get('date'):
                try:
                    dt = datetime.strptime(e['date'], "%Y-%m-%d %H:%M:%S")
                    e['pretty_date'] = dt.strftime("%d %b %Y")
                except:
                    e['pretty_date'] = e['date']
            
            # 3. Parsear servicios si vienen como string JSON de la DB
            if isinstance(e.get('services'), str):
                try: e['services'] = json.loads(e['services'])
                except: e['services'] = []

            processed_events.append(e)
                
        return processed_events

    def get_event_by_id(self, event_id):
        # Usamos el método que ya tienes pero asegurando que traiga todo
        event = self.event_dao.get_by_id(event_id)
        if not event: return None
        
        e = dict(event)
        e['artists'] = self.artist_dao.get_by_event_id(event_id)
        e['ticketPrices'] = self.ticket_dao.get_by_event_id(event_id)
        return e