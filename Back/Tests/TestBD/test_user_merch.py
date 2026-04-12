import uuid
import time
from app.daos.factories import DAOFactory

print("🛍️ INICIANDO BATERÍA DE PRUEBAS: INTEGRIDAD DE COMPRA (USER-MERCH) 🛍️\n")

user_dao = DAOFactory.get_user_dao()
merch_dao = DAOFactory.get_merch_dao()
purchase_merch_dao = DAOFactory.get_user_merch_dao()

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
mid = str(uuid.uuid4())

# Creamos usuario y producto de merch
user_dao.create({"id": uid, "name": "Comprador Merch", "email": f"merch_{uid[:5]}@test.com", "password_hash": "hash123"})
merch_dao.create({"id": mid, "name": "Sudadera Edición Limitada", "price": 60.0, "category": "Ropa", "image": "sweatshirt.jpg"})

print("--- BLOQUE 1: TRANSACCIÓN DE COMPRA ---")

# TEST 1: Registro de compra con cantidad y precio total
try:
    purchase_id = str(uuid.uuid4())
    qty = 2
    price_unit = 60.0
    
    purchase_merch_dao.create({
        "id": purchase_id,
        "user_id": uid,
        "merch_id": mid,
        "quantity": qty,
        "total_price": qty * price_unit,
        "status": "PENDING"
    })
    
    compras = purchase_merch_dao.get_by_user_id(uid)
    mi_pedido = next(p for p in compras if p['purchase_id'] == purchase_id)
    
    assert_test("Registro de Cantidad", mi_pedido['quantity'] == 2, "Cantidad guardada correctamente.", f"Cantidad errónea: {mi_pedido['quantity']}")
    assert_test("Cálculo de Total", mi_pedido['total_price'] == 120.0, "Total calculado correctamente (2x60€).", f"Precio total erróneo: {mi_pedido['total_price']}")
except Exception as e:
    assert_test("Bloque Registro", False, "", str(e))


print("\n--- BLOQUE 2: LOGÍSTICA (CAMBIOS DE ESTADO) ---")

# TEST 2: Flujo de envío (De PENDING a SHIPPED)
try:
    success = purchase_merch_dao.update_status(purchase_id, "SHIPPED")
    
    historial = purchase_merch_dao.get_by_user_id(uid)
    pedido_actualizado = next(p for p in historial if p['purchase_id'] == purchase_id)
    
    assert_test("Actualización Logística", success and pedido_actualizado['status'] == 'SHIPPED', "El estado cambió a 'SHIPPED'.", "No se pudo actualizar el estado del envío.")
except Exception as e:
    assert_test("Actualización Logística", False, "", str(e))


print("\n--- BLOQUE 3: EL GRAN JOIN (VISTA DE HISTORIAL) ---")

# TEST 3: Recuperación de datos del producto desde la compra
try:
    # Verificamos si al listar las compras, el DAO nos trae el nombre del producto (gracias al JOIN)
    has_product_name = mi_pedido['product_name'] == "Sudadera Edición Limitada"
    has_image = 'product_image' in mi_pedido and mi_pedido['product_image'] is not None
    
    assert_test("Integridad del JOIN Merch", has_product_name, "Se recuperó el nombre del producto vinculado.", f"Nombre incorrecto: {mi_pedido.get('product_name')}")
    assert_test("Recuperación de Imagen", has_image, "La imagen del producto está disponible en el historial.", "No se recuperó la imagen del producto.")
except Exception as e:
    assert_test("Integridad del JOIN Merch", False, "", str(e))


print("\n" + "="*40)
print(f"📊 RESULTADOS DE LA PRUEBA DE MERCHANDISING COMPRADO")
print("="*40)
print(f"Total: {tests_passed + tests_failed} | ✅ {tests_passed} | ❌ {tests_failed}")

if tests_failed == 0:
    print("\n🏆 ESTADO: EL SISTEMA DE LOGÍSTICA Y VENTAS DE MERCH ES FIABLE 🏆")
else:
    print("\n⚠️ ESTADO: REVISAR LÓGICA DE COMPRA O JOINS DE MERCH ⚠️")