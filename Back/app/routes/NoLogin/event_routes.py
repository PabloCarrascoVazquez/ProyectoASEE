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
    """
    Obtiene el detalle completo de un evento por ID
    ---
    tags:
      - Events
    summary: Retorna un evento con sus artistas y precios de tickets asociados
    parameters:
      - name: id
        in: path
        type: string
        required: true
        description: Identificador del evento
    responses:
      200:
        description: Evento completo obtenido exitosamente
      404:
        description: Evento no encontrado
    """
    # Usamos el service para traer el evento YA con sus hijos (artistas y tickets)
    event = event_service.get_event_by_id(id)
    
    if not event:
        return jsonify({"status": "error", "message": "Evento no encontrado"}), 404

    # TRANSFORMACIÓN: Mapeamos el diccionario 'event' al JSON de TypeScript
    return jsonify({
        "id": str(event['id']),
        "name": event['name'],
        "date": event.get('date'), 
        "image": event.get('image'),
        "description": event.get('description'),
        "services": event.get('services', []),
        "mapImage": event.get('mapImage'), 
        "gallery": event.get('gallery', []),
        
        # Ahora usamos event['artists'] que viene del service
        "artists": [
            {
                "id": a['id'],
                "name": a['name'],
                "genre": a['genre'],
                "image": a['image'],
                "spotifyUrl": a.get('spotifyUrl')
            } for a in event.get('artists', [])
        ],
        
        "ticketPrices": [
            {
                "id": t['id'],
                "type": t['type'],
                "price": t['price'],
                "description": t.get('description', ''),
                "features": t.get('features', [])
            } for t in event.get('ticketPrices', [])
        ]
    }), 200

@event_bp.route('/api/events', methods=['GET'])
def get_all_events():
    """
    Obtiene el listado de eventos programados
    ---
    tags:
      - Events
    summary: Retorna la lista de próximos eventos con artistas y tickets
    responses:
      200:
        description: Lista de eventos obtenida con éxito
    """
    # Gracias al cambio en el Service, raw_events ya trae artistas y precios
    raw_events = event_service.get_upcoming_events()
    
    formatted_events = []
    for e in raw_events:
        clean_date = e.get('date', '').split(' ')[0]

        formatted_events.append({
            "id": str(e.get('id')),
            "name": e.get('name'),
            "date": clean_date,
            "prettyDate": e.get('pretty_date'),
            "image": e.get('image'),
            "description": e.get('description', ''),
            "location": e.get('location', 'TBA'),
            "services": e.get('services', []),
            "artists": e.get('artists', []), # Ya no es un array vacío
            "ticketPrices": e.get('ticketPrices', []) # Ya no es un array vacío
        })
    
    return jsonify(formatted_events), 200