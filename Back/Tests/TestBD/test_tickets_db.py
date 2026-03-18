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

# ==========================================
# 🧪 PREPARACIÓN: Necesitamos un Evento Real
# ==========================================
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
    fake_event_id = "este-id-no-existe-en-la-bd"
    ticket_dao.create({
        "id": str(uuid.uuid4()),
        "event_id": fake_event_id, # Esto debería disparar un error de FK
        "type": "Fantasma",
        "price": 99.99,
        "features": []
    })
    assert_test("Violación de FK (Huerfano)", False, "", "¡CRÍTICO! Permitió crear un ticket para un evento inexistente.")
except Exception as e:
    # Esperamos un error de Foreign Key
    assert_test("Violación de FK (Huerfano)", "FOREIGN KEY" in str(e).upper(), f"Bloqueó el ticket huérfano: {e}", f"Falló por otro motivo: {e}")

# TEST 2: Crear Ticket válido y verificar el JOIN
try:
    ticket_id = str(uuid.uuid4())
    ticket_dao.create({
        "id": ticket_id,
        "event_id": valid_event_id,
        "type": "VIP Oro",
        "price": 250.0,
        "features": ["Barra Libre", "Backstage"]
    })
    
    # Recuperamos los tickets del evento
    tickets_del_evento = ticket_dao.get_by_event_id(valid_event_id)
    found = any(t['id'] == ticket_id for t in tickets_del_evento)
    
    assert_test("Relación Padre-Hijo", found, "Ticket vinculado y recuperado correctamente.", "No se encontró el ticket vinculado al evento.")
except Exception as e:
    assert_test("Relación Padre-Hijo", False, "", str(e))


print("\n--- BLOQUE 2: TIPOS DE DATOS (PRECISIÓN NUMÉRICA) ---")

# TEST 3: Manejo de Decimales (Precios)
# SQLite usa REAL (punto flotante). Probamos que no haya errores de redondeo básicos.
try:
    price_id = str(uuid.uuid4())
    weird_price = 19.99
    ticket_dao.create({
        "id": price_id,
        "event_id": valid_event_id,
        "type": "Oferta",
        "price": weird_price,
        "features": []
    })
    
    tickets = ticket_dao.get_by_event_id(valid_event_id)
    saved_ticket = next(t for t in tickets if t['id'] == price_id)
    
    assert_test("Precisión de Precio", saved_ticket['price'] == 19.99, "El precio 19.99 se mantuvo exacto.", f"El precio cambió a {saved_ticket['price']}")
except Exception as e:
    assert_test("Precisión de Precio", False, "", str(e))


print("\n--- BLOQUE 3: CONSISTENCIA DE LISTAS ---")

# TEST 4: Features como JSON en Tickets
try:
    feat_id = str(uuid.uuid4())
    features_list = ["Acceso A", "Acceso B", "Regalo"]
    ticket_dao.create({
        "id": feat_id,
        "event_id": valid_event_id,
        "type": "Pack Regalo",
        "price": 50.0,
        "features": features_list
    })
    
    tickets = ticket_dao.get_by_event_id(valid_event_id)
    saved_t = next(t for t in tickets if t['id'] == feat_id)
    
    assert_test("Features JSON (Ticket)", isinstance(saved_t['features'], list) and len(saved_t['features']) == 3, "Las ventajas (features) se parsearon correctamente.", "Error al recuperar la lista de ventajas.")
except Exception as e:
    assert_test("Features JSON (Ticket)", False, "", str(e))


print("\n" + "="*40)
print(f"📊 RESULTADOS DE LA PRUEBA DE TICKETS & RELACIONES")
print("="*40)
print(f"Total: {tests_passed + tests_failed} | ✅ {tests_passed} | ❌ {tests_failed}")

if tests_failed == 0:
    print("\n🏆 ESTADO: LAS RELACIONES SON INDESTRUCTIBLES 🏆")
else:
    print("\n⚠️ ESTADO: REVISAR LA CONFIGURACIÓN DE CLAVES FORÁNEAS ⚠️")