from app.services.vendor_service import VendorService
from app.services.event_service import EventService # Importamos también el servicio de eventos

v_service = VendorService()
e_service = EventService()

try:
    print("\n--- SETUP: Creando evento para el puesto ---")
    # Creamos un evento real para que la base de datos lo reconozca
    evento = e_service.create_festival_event(
        "Gastronomy Fest 2026", 
        "2026-07-15 12:00:00", 
        "Festival de comida callejera"
    )
    event_id = evento['id']

    print("🎪 Creando nuevo espacio en el recinto...")
    nuevo_puesto = v_service.register_new_vendor_space(
        event_id=event_id, # Usamos el ID recién creado
        name="Tacos El Güero",
        services_list=["Electricidad", "Agua", "Salida de Humos"]
    )
    print(f"✅ Espacio '{nuevo_puesto['name']}' registrado correctamente.")

    print("\n📍 Consultando disponibilidad para el mapa...")
    disponibles = v_service.get_available_spaces_for_event(event_id)
    for s in disponibles:
        print(f"- {s['name']}: {s['status_text']} (Servicios: {s['services']})")

except Exception as e:
    print(f"❌ Error en VendorService: {e}")