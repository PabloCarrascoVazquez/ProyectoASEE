from flask import Blueprint, jsonify
# Importamos los servicios necesarios
from app.services.event_service import EventService
from app.services.ticket_service import TicketService

# 1. Definimos el Blueprint
event_bp = Blueprint('event_bp', __name__)

# 2. Instanciamos los servicios para usarlos en las rutas
event_service = EventService()
ticket_service = TicketService()
# artist_service = ArtistService() 

@event_bp.route('/api/events/<id>/full', methods=['GET'])
def get_event_full(id):
    event = event_service.get_event_by_id(id)
    if not event:
        return jsonify({"status": "error", "message": "Evento no encontrado"}), 404

    tickets = ticket_service.get_prices_by_event_id(id)

    # TRANSFORMACIÓN: Adaptamos el JSON a tus interfaces de TypeScript
    return jsonify({
        "id": event['id'],
        "name": event['name'],
        "date": event.get('date_iso'), # Mapeamos date_iso -> date
        "image": event.get('image'),
        "description": event.get('description'),
        "services": event.get('services', []),
        "mapImage": event.get('map_image'), # Mapeamos map_image -> mapImage
        "gallery": event.get('gallery', []),
        
        # Mapeamos la lista de artistas
        "artists": [
            {
                "id": a['id'],
                "name": a['name'],
                "genre": a['genre'],
                "image": a['image'],
                "spotifyUrl": a.get('spotify_url') # Mapeamos spotify_url -> spotifyUrl
            } for a in artists
        ],
        
        # Mapeamos ticket_options -> ticketPrices
        "ticketPrices": [
            {
                "id": t['id'],
                "type": t['type'],
                "price": t['price'],
                "description": t.get('description', ''),
                "features": t.get('features', [])
            } for t in tickets
        ]
    }), 200


@event_bp.route('/api/events', methods=['GET'])
def get_all_events():
    raw_events = event_service.get_upcoming_events()
    
    formatted_events = []
    for e in raw_events:
        # Extraemos solo la parte de la fecha (YYYY-MM-DD) del string original
        # '2026-07-15 12:00:00' -> split(' ') -> '2026-07-15'
        clean_date = e.get('date', '').split(' ')[0]

        formatted_events.append({
            "id": str(e.get('id')),
            "name": e.get('name'),
            "date": clean_date,  # <--- Ahora coincide con el input de React
            "prettyDate": e.get('pretty_date'),
            "image": e.get('image'),
            "description": e.get('description', ''),
            "location": e.get('location', 'TBA'),
            "services": e.get('services', []),
            "artists": e.get('artists', []), # Asegúrate de que esto sea un array
            "ticketPrices": e.get('ticketPrices', []) # Asegúrate de que esto sea un array
        })
    
    return jsonify(formatted_events), 200