from app.services.ticket_service import TicketService
from app.services.user_service import UserService
from app.services.event_service import EventService
from app.daos.factories import DAOFactory
import uuid

t_service = TicketService()
u_service = UserService()
e_service = EventService()

try:
    print("🎫 --- SETUP: Preparando entorno de compra ---")
    # 1. Crear un usuario real
    user_id = u_service.register_user("Comprador Test", "comprador@test.com", "pass123")
    
    # 2. Crear un evento real
    evento = e_service.create_festival_event("Subsonic Opening", "2026-08-20 22:00:00", "Gran apertura")
    
    # 3. Crear un precio real en la DB (usando el DAO directamente para el setup)
    price_dao = DAOFactory.get_ticket_price_dao()
    price_id = str(uuid.uuid4())
    price_dao.create({
        "id": price_id,
        "event_id": evento['id'],
        "type": "General Pass",
        "price": 45.50,
        "features": '["Acceso General", "1 Bebida"]'
    })

    print("\n🚀 Iniciando simulación de compra...")
    compra = t_service.purchase_ticket(
        user_id=user_id, 
        ticket_price_id=price_id
    )
    print(f"✅ ¡Compra exitosa! Ticket ID: {compra['id']} generado.")

    print("\n📱 Consultando 'Mis Entradas'...")
    wallet = t_service.get_user_wallet(user_id)
    for t in wallet:
        print(f"- Entrada {t['status']} para el evento")

except Exception as e:
    print(f"❌ Error en la transacción: {e}")