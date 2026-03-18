import uuid
from app.daos.factories import DAOFactory

print("🍔 INICIANDO BATERÍA DE PRUEBAS: ESPACIOS PARA VENDEDORES 🍔\n")

vendor_dao = DAOFactory.get_vendor_space_dao()
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
# 🏗️ PREPARACIÓN: Necesitamos un Evento
# ==========================================
event_id = str(uuid.uuid4())
event_dao.create({
    "id": event_id,
    "name": "Zona Gastro Subsonic",
    "date": "2026-08-20 12:00:00",
    "description": "Prueba de Food Trucks",
    "services": []
})

print("--- BLOQUE 1: DISPONIBILIDAD Y BOOLEANOS ---")

# TEST 1: Crear un puesto disponible y uno NO disponible
try:
    # Puesto A: Disponible (True / 1)
    vendor_dao.conn.execute(
        "INSERT INTO vendor_spaces (id, event_id, name, available, services) VALUES (?, ?, ?, ?, ?)",
        (str(uuid.uuid4()), event_id, "Burger Master", 1, '["Electricidad", "Agua"]')
    )
    # Puesto B: Ocupado (False / 0)
    vendor_dao.conn.execute(
        "INSERT INTO vendor_spaces (id, event_id, name, available, services) VALUES (?, ?, ?, ?, ?)",
        (str(uuid.uuid4()), event_id, "Pizza Palace", 0, '["Electricidad"]')
    )
    vendor_dao.conn.commit()
    
    # El método get_by_event_id solo debe traer los disponibles (available = TRUE)
    disponibles = vendor_dao.get_by_event_id(event_id)
    
    solo_disponibles = all(v['available'] == 1 for v in disponibles)
    count_ok = len(disponibles) == 1
    
    assert_test("Filtro Disponibilidad (Boolean)", solo_disponibles and count_ok, 
                "El DAO filtró correctamente y solo trajo el puesto disponible.", 
                "El filtro falló: trajo puestos ocupados o ninguno.")
except Exception as e:
    assert_test("Filtro Disponibilidad (Boolean)", False, "", str(e))


print("\n--- BLOQUE 2: SERVICIOS Y JSON ---")

# TEST 2: Parseo de servicios del vendedor
try:
    puesto = disponibles[0]
    servicios = puesto['services']
    
    is_list = isinstance(servicios, list)
    has_wifi = "Electricidad" in servicios
    
    assert_test("Parseo JSON Servicios", is_list and has_wifi, 
                f"Servicios recuperados correctamente: {servicios}", 
                "Error al parsear la lista de servicios del vendedor.")
except Exception as e:
    assert_test("Parseo JSON Servicios", False, "", str(e))


print("\n" + "="*40)
print(f"📊 RESULTADOS FINALES: VENDOR SPACES")
print("="*40)
print(f"Total: {tests_passed + tests_failed} | ✅ {tests_passed} | ❌ {tests_failed}")

if tests_failed == 0:
    print("\n🏆 ¡FELICIDADES! HAS COMPLETADO TODOS LOS TESTS DE LA BASE DE DATOS 🏆")
    print("Tu backend tiene ahora una base de datos blindada, portable y lista para el equipo.")
else:
    print("\n⚠️ REVISAR LÓGICA DE VENDEDORES ⚠️")