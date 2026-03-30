import uuid
import json
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
disponibles = [] # Inicializamos para el siguiente bloque
try:
    # Puesto A: Disponible (1). Insertamos 'Electricidad' para que el Bloque 2 no falle.
    vendor_dao.conn.execute(
        "INSERT INTO vendor_spaces (id, event_id, name, available, services) VALUES (?, ?, ?, ?, ?)",
        (str(uuid.uuid4()), event_id, "Burger Master", 1, '["Electricidad", "Agua"]')
    )
    # Puesto B: Ocupado (0)
    vendor_dao.conn.execute(
        "INSERT INTO vendor_spaces (id, event_id, name, available, services) VALUES (?, ?, ?, ?, ?)",
        (str(uuid.uuid4()), event_id, "Pizza Palace", 0, '["Luz"]')
    )
    vendor_dao.conn.commit()
    
    # El método get_by_event_id debe filtrar por available = 1
    disponibles = vendor_dao.get_by_event_id(event_id)
    
    # Verificamos que solo traiga los disponibles
    solo_disponibles = all(v['available'] in [1, True] for v in disponibles)
    count_ok = len(disponibles) == 1
    
    assert_test("Filtro Disponibilidad", solo_disponibles and count_ok, 
                "El DAO filtró correctamente y solo trajo el puesto disponible.", 
                "El filtro falló: trajo puestos ocupados o cantidad incorrecta.")
except Exception as e:
    assert_test("Filtro Disponibilidad", False, "", str(e))

print("\n--- BLOQUE 2: SERVICIOS Y JSON ---")

# TEST 2: Parseo de servicios del vendedor
try:
    if not disponibles:
        raise Exception("No hay puestos disponibles para testear el JSON.")
        
    puesto = disponibles[0]
    servicios = puesto['services']
    
    # Si el DAO ya lo convirtió a lista, perfecto. 
    if isinstance(servicios, str):
        servicios = json.loads(servicios)
    
    # Verificación real de contenido y tipo
    es_lista = isinstance(servicios, list)
    tiene_electricidad = "Electricidad" in servicios
    
    if es_lista and tiene_electricidad:
        assert_test("Parseo JSON Servicios", True, 
                    f"Servicios recuperados correctamente como lista: {servicios}", "")
    else:
        # Mensaje detallado en caso de error para debuggear
        msg = f"Se esperaba lista con 'Electricidad'. Se obtuvo {type(servicios)}: {servicios}"
        assert_test("Parseo JSON Servicios", False, "", msg)

except Exception as e:
    assert_test("Parseo JSON Servicios", False, "", f"Error inesperado: {str(e)}")


print("\n" + "="*40)
print(f"📊 RESULTADOS FINALES: VENDOR SPACES")
print("="*40)
print(f"Total: {tests_passed + tests_failed} | ✅ {tests_passed} | ❌ {tests_failed}")

if tests_failed == 0:
    print("\n🏆 ¡FELICIDADES! PLENO VERDE EN VENDEDORES 🏆")
    print("La base de datos está lista para el despliegue de servicios.")
else:
    print("\n⚠️ REVISAR LÓGICA DE VENDEDORES ⚠️")