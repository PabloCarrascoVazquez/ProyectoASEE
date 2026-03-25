import uuid
from app.daos.factories import DAOFactory, DatabaseConnectionFactory

print("🎸 INICIANDO BATERÍA DE PRUEBAS: ARTISTAS Y LINE-UP (N:M) 🎸\n")

artist_dao = DAOFactory.get_artist_dao()
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
# 🏗️ SETUP: Un Evento y un Artista
# ==========================================
eid = str(uuid.uuid4())
aid = str(uuid.uuid4())

event_dao.create({
    "id": eid, "name": "Noche de Techno", "date": "2026-09-12 23:00:00", 
    "description": "Evento de prueba", "services": []
})

artist_dao.create({
    "id": aid, "name": "Charlotte de Witte", "genre": "Techno", 
    "image": "charlotte.jpg", "spotifyUrl": "https://spotify.com/..."
})

print("--- BLOQUE 1: EL LINE-UP (TABLA INTERMEDIA) ---")

# TEST 1: Vincular Artista a Evento (Simulando el contrato)
try:
    # Como no tenemos un DAO específico para la tabla intermedia 'event_artists',
    # usamos la conexión directamente para insertar el vínculo.
    conn = DatabaseConnectionFactory.get_connection() if hasattr(artist_dao, 'conn') else artist_dao.conn
    conn.execute(
        "INSERT INTO event_artists (event_id, artist_id) VALUES (?, ?)",
        (eid, aid)
    )
    conn.commit()
    assert_test("Vínculo N:M", True, "Artista vinculado al evento con éxito.", "")
except Exception as e:
    assert_test("Vínculo N:M", False, "", str(e))

# TEST 2: Recuperar el Line-up de un evento
try:
    lineup = artist_dao.get_by_event_id(eid)
    
    found = any(a['name'] == "Charlotte de Witte" for a in lineup)
    count_ok = len(lineup) >= 1
    
    assert_test("Recuperación de Line-up", found and count_ok, 
                f"Se recuperó a {lineup[0]['name']} como parte del evento.", 
                "El artista no aparece en el line-up del evento.")
except Exception as e:
    assert_test("Recuperación de Line-up", False, "", str(e))


print("\n--- BLOQUE 2: CATÁLOGO MUSICAL COMPLETO ---")

# TEST 3: Listado general de artistas (Vista 3 de tu App)
try:
    todos_artistas = artist_dao.get_all()
    assert_test("Lectura Global Artistas", len(todos_artistas) >= 1, 
                f"Total de artistas en el sistema: {len(todos_artistas)}", 
                "No se pudo leer el catálogo de artistas.")
except Exception as e:
    assert_test("Lectura Global Artistas", False, "", str(e))


print("\n" + "="*40)
print(f"📊 RESULTADOS FINALES: ARTISTAS & MÚSICA")
print("="*40)
print(f"Total: {tests_passed + tests_failed} | ✅ {tests_passed} | ❌ {tests_failed}")

if tests_failed == 0:
    print("\n🏆 ¡BRUTAL! TODA LA LÓGICA DE DATOS ESTÁ VALIDADA 🏆")
    print("Has cubierto Usuarios, Eventos, Tickets, Compras, Merchandising y Artistas.")
else:
    print("\n⚠️ REVISAR RELACIÓN N:M DE ARTISTAS ⚠️")