import uuid
from app.daos.factories import DAOFactory

print("🎫 INICIANDO BATERÍA DE PRUEBAS: TICKETS & RELACIONES 🎫\n")

ticket_dao = DAOFactory.get_ticket_price_dao()
event_dao = DAOFactory.get_event_dao()

tests_passed = 0
tests_failed = 0

def assert_test(test_name, condition, success_msg, fail_msg):
    global tests_passed, tests_failed
    if condition:
        print(f"   ✅ [PASS] {test_name}: {success_msg}")
        tests_passed += 1
    else:
        print(f"   ❌ [FAIL] {test_name}: {fail_msg}")
        tests_failed += 1

# Aseguramos que SQLite tenga activas las FK para esta sesión de test
if hasattr(ticket_dao, 'conn'):
    ticket_dao.conn.execute("PRAGMA foreign_keys = ON")

# PREPARACIÓN: Evento Real
valid_event_id = str(uuid.uuid4())
event_dao.create({
    "id": valid_event_id,
    "name": "Evento Padre",
    "date": "2026-07-15 22:00:00",
    "description": "Evento para probar hijos",
    "services": ["Test"]
})

print("--- BLOQUE 1: INTEGRIDAD REFERENCIAL (FOREIGN KEYS) ---")

# TEST 1: Crear Ticket para un Evento que NO existe
try:
    fake_event_id = str(uuid.uuid4())
    ticket_dao.create({
        "id": str(uuid.uuid4()),
        "event_id": fake_event_id, 
        "type": "Fantasma",
        "price": 99.99,
        "features": []
    })
    assert_test("Violación de FK (Huérfano)", False, "", "¡CRÍTICO! SQLite permitió un ticket sin evento (¿PRAGMA foreign_keys ON?)")
except Exception as e:
    # En SQLite el error suele decir "FOREIGN KEY constraint failed"
    error_msg = str(e).upper()
    is_fk_error = "FOREIGN KEY" in error_msg or "INTEGRITY" in error_msg
    assert_test("Violación de FK (Huérfano)", is_fk_error, f"Bloqueó el ticket huérfano correctamente: {e}", f"Falló por otro motivo: {e}")

# TEST 2: Relación y recuperación
try:
    ticket_id = str(uuid.uuid4())
    ticket_dao.create({
        "id": ticket_id,
        "event_id": valid_event_id,
        "type": "VIP Oro",
        "price": 250.0,
        "features": ["Barra Libre"]
    })
    
    tickets_del_evento = ticket_dao.get_by_event_id(valid_event_id)
    found = any(t['id'] == ticket_id for t in tickets_del_evento)
    assert_test("Relación Padre-Hijo", found, "Ticket vinculado recuperado.", "No se encontró el ticket.")
except Exception as e:
    assert_test("Relación Padre-Hijo", False, "", str(e))

print(f"\n📊 TOTAL TICKETS: ✅ {tests_passed} | ❌ {tests_failed}")