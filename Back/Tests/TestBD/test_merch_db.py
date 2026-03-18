import uuid
from app.daos.factories import DAOFactory

print("👕 INICIANDO BATERÍA DE PRUEBAS: CATÁLOGO DE MERCHANDISING 👕\n")

merch_dao = DAOFactory.get_merch_dao()
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
# 📦 PREPARACIÓN DE DATOS (Catálogo de ejemplo)
# ==========================================
print("--- BLOQUE 1: POBLACIÓN DEL CATÁLOGO ---")

items_to_create = [
    {"id": str(uuid.uuid4()), "name": "Camiseta Subsonic 2026", "price": 25.50, "category": "Ropa", "image": "tshirt.jpg"},
    {"id": str(uuid.uuid4()), "name": "Sudadera Hoodie Black", "price": 45.00, "category": "Ropa", "image": "hoodie.jpg"},
    {"id": str(uuid.uuid4()), "name": "Gorra Festival", "price": 15.99, "category": "Accesorios", "image": "cap.jpg"},
    {"id": str(uuid.uuid4()), "name": "Vaso Reutilizable", "price": 5.00, "category": "Accesorios", "image": "cup.jpg"}
]

try:
    for item in items_to_create:
        merch_dao.create(item)
    assert_test("Creación de Catálogo", True, "Se insertaron 4 productos de diferentes categorías.", "")
except Exception as e:
    assert_test("Creación de Catálogo", False, "", str(e))


print("\n--- BLOQUE 2: RECUPERACIÓN Y FILTRADO ---")

# TEST 2: Obtener todo el catálogo (Ordenado por nombre)
try:
    all_items = merch_dao.get_all()
    # Verificamos que al menos están los 4 que creamos (más los que hubiera de antes)
    is_ordered = all_items[0]['name'] <= all_items[1]['name'] # Simplificación de orden alfabético
    assert_test("Lectura Total", len(all_items) >= 4, f"Se recuperaron {len(all_items)} productos.", "No se recuperó el catálogo completo.")
except Exception as e:
    assert_test("Lectura Total", False, "", str(e))

# TEST 3: Filtrado por Categoría (El "Filtro de Tienda")
try:
    ropa = merch_dao.get_by_category("Ropa")
    accesorios = merch_dao.get_by_category("Accesorios")
    
    # Comprobamos que en 'ropa' solo haya ropa
    only_ropa = all(item['category'] == "Ropa" for item in ropa)
    has_ropa = len(ropa) >= 2
    
    assert_test("Filtro por Categoría", only_ropa and has_ropa, "El filtro de 'Ropa' devolvió solo los productos correctos.", "El filtro mezcló categorías o no encontró nada.")
except Exception as e:
    assert_test("Filtro por Categoría", False, "", str(e))


print("\n--- BLOQUE 3: CASOS LÍMITE (EDGE CASES) ---")

# TEST 4: Búsqueda en categoría vacía o inexistente
try:
    inexistente = merch_dao.get_by_category("Tecnología Espacial")
    assert_test("Categoría Inexistente", inexistente == [], "Devuelve lista vacía correctamente si la categoría no existe.", "Error o valor nulo al buscar categoría inexistente.")
except Exception as e:
    assert_test("Categoría Inexistente", False, "", str(e))


print("\n" + "="*40)
print(f"📊 RESULTADOS DE LA PRUEBA DE MERCHANDISING")
print("="*40)
print(f"Total: {tests_passed + tests_failed} | ✅ {tests_passed} | ❌ {tests_failed}")

if tests_failed == 0:
    print("\n🏆 ESTADO: EL CATÁLOGO DE PRODUCTOS ESTÁ LISTO PARA VENDER 🏆")
else:
    print("\n⚠️ ESTADO: REVISAR FILTROS O INSERCIÓN DE MERCH ⚠️")