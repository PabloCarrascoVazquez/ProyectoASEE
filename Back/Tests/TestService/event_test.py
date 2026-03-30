from app.services.event_service import EventService

e_service = EventService()

try:
    print("📅 Consultando eventos próximos...")
    eventos = e_service.get_upcoming_events()
    for e in eventos:
        print(f"- {e['name']} el {e.get('pretty_date', 'Fecha pendiente')}")

    # Prueba de fuego: Detalle con Line-up
    if eventos:
        print(f"\n🔍 Obteniendo detalles completos de: {eventos[0]['name']}")
        detalle = e_service.get_event_details(eventos[0]['id'])
        print(f"🎸 Artistas confirmados: {len(detalle['lineup'])}")
        for art in detalle['lineup']:
            print(f"   -> {art['name']} ({art['genre']})")

except Exception as e:
    print(f"❌ Error en EventService: {e}")