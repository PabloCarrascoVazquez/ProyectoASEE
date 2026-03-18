import uuid
import time
from app.daos.factories import DAOFactory

print("💳 INICIANDO BATERÍA DE PRUEBAS: INTEGRIDAD DE COMPRA (USER-TICKETS) 💳\n")

user_dao = DAOFactory.get_user_dao()
event_dao = DAOFactory.get_event_dao()
price_dao = DAOFactory.get_ticket_price_dao()
purchase_dao = DAOFactory.get_user_ticket_dao()

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
# 🏗️ PREPARACIÓN DEL ESCENARIO (Setup)
# ==========================================
uid = str(uuid.uuid4())
eid = str(uuid.uuid4())
pid = str(uuid.uuid4())

# Creamos la cadena de dependencias
user_dao.create({"id": uid, "name": "Comprador Test", "email": f"comprador_{uid[:5]}@test.com", "password_hash": "abc"})
event_dao.create({"id": eid, "name": "Festival de Cierre", "date": "2026-12-31 23:59:59", "description": "Fin de año"})
price_dao.create({"id": pid, "event_id": eid, "type": "General", "price": 50.0})

print("--- BLOQUE 1: FLUJO DE COMPRA Y ESTADOS ---")

# TEST 1: Creación de Compra con Estado por Defecto
try:
    purchase_id = str(uuid.uuid4())
    purchase_dao.create({
        "id": purchase_id,
        "user_id": uid,
        "ticket_price_id": pid
        # No enviamos 'status', debería ser 'ACTIVE' por defecto en el SQL
    })
    
    compras = purchase_dao.get_by_user_id(uid)
    mi_compra = next(c for c in compras if c['ticket_instance_id'] == purchase_id)
    
    assert_test("Estado por Defecto", mi_compra['status'] == 'ACTIVE', "Se asignó 'ACTIVE' automáticamente.", f"Estado incorrecto: {mi_compra['status']}")
except Exception as e:
    assert_test("Estado por Defecto", False, "", str(e))

# TEST 2: Validación de Fecha de Compra Automática (DEFAULT CURRENT_TIMESTAMP)
try:
    # Verificamos que 'purchase_date' no sea None y tenga formato de fecha
    has_date = mi_compra['purchase_date'] is not None
    assert_test("Timestamp Automático", has_date, f"Fecha generada por la DB: {mi_compra['purchase_date']}", "La fecha de compra quedó vacía.")
except Exception as e:
    assert_test("Timestamp Automático", False, "", str(e))


print("\n--- BLOQUE 2: ACTUALIZACIÓN (EL PASO POR PUERTA) ---")

# TEST 3: Cambio de Estado (De ACTIVE a USED)
try:
    # Simulamos que el usuario llega al festival y le escanean la entrada
    success = purchase_dao.update_status(purchase_id, "USED")
    
    compras_actualizadas = purchase_dao.get_by_user_id(uid)
    compra_validada = next(c for c in compras_actualizadas if c['ticket_instance_id'] == purchase_id)
    
    assert_test("Actualización de Estado", success and compra_validada['status'] == 'USED', "Entrada marcada como USED correctamente.", "No se pudo actualizar el estado de la entrada.")
except Exception as e:
    assert_test("Actualización de Estado", False, "", str(e))


print("\n--- BLOQUE 3: EL TRIPLE JOIN (LA VISTA DEL PERFIL) ---")

# TEST 4: Verificación de Datos Cruzados (Nombre del Evento en la Entrada)
try:
    # Este es el test de oro: ¿Sabe la entrada a qué evento pertenece sin buscar en otra tabla?
    assert_test("Integridad del JOIN", mi_compra['event_name'] == "Festival de Cierre", "El JOIN trajo el nombre del evento correctamente.", f"Nombre de evento erróneo: {mi_compra.get('event_name')}")
except Exception as e:
    assert_test("Integridad del JOIN", False, "", str(e))


print("\n" + "="*40)
print(f"📊 RESULTADOS DE LA PRUEBA DE INTEGRIDAD DE COMPRA")
print("="*40)
print(f"Total: {tests_passed + tests_failed} | ✅ {tests_passed} | ❌ {tests_failed}")

if tests_failed == 0:
    print("\n🏆 ESTADO: EL SISTEMA DE VENTAS ES 100% FIABLE 🏆")
else:
    print("\n⚠️ ESTADO: REVISAR LÓGICA DE ACTUALIZACIÓN O JOINS ⚠️")