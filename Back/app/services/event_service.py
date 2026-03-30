import uuid
from datetime import datetime
from app.daos.factories import DAOFactory

class EventService:
    def __init__(self):
        self.event_dao = DAOFactory.get_event_dao()
        self.artist_dao = DAOFactory.get_artist_dao()

    def get_upcoming_events(self):
        """
        Retorna todos los eventos. 
        Aquí podríamos filtrar por fecha > hoy en el futuro.
        """
        events = self.event_dao.get_all()
        
        for event in events:
            if event['date']:
                dt = datetime.strptime(event['date'], "%Y-%m-%d %H:%M:%S")
                event['pretty_date'] = dt.strftime("%d %b %Y")
                
        return events

    def get_event_details(self, event_id):
        """
        Retorna el evento con su Line-up de artistas incluido.
        ¡El 'Triple Play' de la arquitectura!
        """
        event = self.event_dao.get_by_id(event_id)
        if not event:
            return None

        #Artistas vinculados a este evento (N:M)
        event['lineup'] = self.artist_dao.get_by_event_id(event_id)
        
        return event

    def create_festival_event(self, name, date_str, description, services=None):
        """
        Crea un evento validando el formato de fecha.
        """
        try:
            datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            raise ValueError("El formato de fecha debe ser YYYY-MM-DD HH:MM:SS")

        event_data = {
            "id": str(uuid.uuid4()),
            "name": name,
            "date": date_str,
            "description": description,
            "image": "default_event.jpg",
            "services": services if services else [],
            "gallery": [],
            "mapImage": None
        }

        self.event_dao.create(event_data)
        return event_data