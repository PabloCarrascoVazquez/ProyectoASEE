import uuid
import datetime
from app.daos.factories import DAOFactory

print("🎪 INICIANDO BATERÍA DE PRUEBAS EXHAUSTIVAS: EVENT DAO 🎪\n")

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

base_id = str(uuid.uuid4())
future_date = (datetime.datetime.now() + datetime.timedelta(days=100)).strftime("%Y-%m-%d %H:%M:%S")

print("--- BLOQUE 1: LISTAS Y JSON (SERIALIZACIÓN) ---")

# TEST 1: Inserción de Listas Completas
try:
    event_dao.create({
        "id": base_id,
        "name": "Festival de Pruebas",
        "date": future_date,
        "description": "Un evento con muchos servicios.",
        "image": "img.png",
        "services": ["Food Trucks", "Zona VIP", "Merchandising"],
        "gallery": ["foto1.jpg", "foto2.jpg"],
        "mapImage": "mapa.png"
    })
    
    db_event = event_dao.get_by_id(base_id)
    # Comprobamos que el texto de la BD se haya convertido de vuelta a una verdadera lista de Python
    is_list = isinstance(db_event['services'], list)
    has_items = len(db_event['services']) == 3
    
    assert_test("Parseo JSON Completo", is_list and has_items, "Las listas se guardan y recuperan como verdaderas listas (list).", "El JSON se corrompió o devolvió un string.")
except Exception as e:
    assert_test("Parseo JSON Completo", False, "", str(e))

# TEST 2: Listas Vacías (Edge Case)
try:
    empty_id = str(uuid.uuid4())
    event_dao.create({
        "id": empty_id,
        "name": "Evento Sin Nada",
        "date": future_date,
        "description": "Pobreza absoluta.",
        "image": None,
        "services": [], # ¡Lista vacía!
        "gallery": []
    })
    
    db_empty = event_dao.get_by_id(empty_id)
    assert_test("Parseo JSON Vacío", db_empty['services'] == [], "Maneja listas vacías sin devolver None o fallar.", "No supo leer una lista vacía.")
except Exception as e:
    assert_test("Parseo JSON Vacío", False, "", str(e))

# TEST 3: Omisión de Listas (Default fallback)
try:
    omitted_id = str(uuid.uuid4())
    event_dao.create({
        "id": omitted_id,
        "name": "Evento Olvidadizo",
        "date": future_date,
        "description": "Se me olvidó mandar los servicios.",
        # No mandamos 'services' ni 'gallery' a propósito
    })
    
    db_omitted = event_dao.get_by_id(omitted_id)
    # Nuestro DAO debería usar .get('services', []) y transformarlo en una lista vacía
    assert_test("Omisión de JSON (Default)", isinstance(db_omitted['services'], list), "El DAO inyectó una lista vacía de forma segura.", "Falló al no recibir los campos opcionales.")
except Exception as e:
    assert_test("Omisión de JSON (Default)", False, "", str(e))


print("\n--- BLOQUE 2: ESTRÉS DE DATOS MASIVOS ---")

# TEST 4: Carga masiva en JSON (10,000 elementos en una lista)
try:
    massive_id = str(uuid.uuid4())
    massive_gallery = [f"foto_{i}.jpg" for i in range(10000)] # Creamos 10,000 strings
    
    event_dao.create({
        "id": massive_id,
        "name": "El Evento Infinito",
        "date": future_date,
        "description": "Muchas fotos.",
        "services": [],
        "gallery": massive_gallery
    })
    
    db_massive = event_dao.get_by_id(massive_id)
    assert_test("Carga Masiva (TEXT Limit)", len(db_massive['gallery']) == 10000, "Soportó guardar y parsear 10,000 elementos en una sola celda.", "Desbordamiento de memoria o recorte de datos.")
except Exception as e:
    assert_test("Carga Masiva (TEXT Limit)", False, "", str(e))


print("\n--- BLOQUE 3: ESTRUCTURAS INESPERADAS ---")

# TEST 5: Ataque de Inyección JSON (Tratando de romper el parseo)
try:
    hacker_id = str(uuid.uuid4())
    # Mandamos una cadena con formato JSON corrupto o malicioso haciéndonos pasar por una lista
    event_dao.create({
        "id": hacker_id,
        "name": "Evento Hacker",
        "date": future_date,
        "description": "Hacking",
        "services": ['"} ; DROP TABLE events; --', 'Normal Service'],
        "gallery": []
    })
    
    db_hacker = event_dao.get_by_id(hacker_id)
    assert_test("Inyección en JSON", db_hacker['services'][0] == '"} ; DROP TABLE events; --', "El JSON escapó los caracteres maliciosos correctamente.", "La inyección rompió el JSON o la base de datos.")
except Exception as e:
    assert_test("Inyección en JSON", False, "", f"Error inesperado: {e}")


print("\n" + "="*40)
print(f"📊 RESULTADOS DE LA PRUEBA EXHAUSTIVA DE EVENTOS")
print("="*40)
print(f"Total de pruebas: {tests_passed + tests_failed}")
print(f"✅ Exitosas: {tests_passed}")
print(f"❌ Fallidas: {tests_failed}")

if tests_failed == 0:
    print("\n🏆 ESTADO: MANEJO DE JSON Y FECHAS NIVEL DIOS 🏆")
else:
    print("\n⚠️ ESTADO: HAY BUGS EN EL PARSEO O EN EL DAO ⚠️")