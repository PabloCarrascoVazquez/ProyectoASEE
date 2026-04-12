import uuid
from app.services.merch_service import MerchService
from app.daos.factories import DAOFactory

# Instanciamos servicios y DAOs para preparación
merch_service = MerchService()
user_dao = DAOFactory.get_user_dao()

print("🚀 INICIANDO TEST INTEGRAL DE MERCH SERVICE 🚀\n")

try:
    # 1. PREPARACIÓN: Crear un usuario de prueba
    user_id = str(uuid.uuid4())
    user_dao.create({
        "id": user_id, 
        "name": "User Test Service", 
        "email": f"service_{user_id[:4]}@test.com", 
        "password_hash": "secret"
    })
    print(f"👤 Usuario de prueba creado: {user_id}")

    # 2. CATÁLOGO: Añadir productos
    print("\n📦 Bloque 1: Gestión de Catálogo")
    p1 = merch_service.add_product_to_catalog("Vinilo Subsonic '26", 45.00, "Música", "vinyl.jpg")
    p2 = merch_service.add_product_to_catalog("Gorra Neon", 20.00, "Accesorios", "cap.jpg")
    print(f"✅ Productos añadidos: {p1['name']} y {p2['name']}")

    # 3. FILTRADO: Probar lógica de categorías
    print("\n🔍 Bloque 2: Filtrado por Categoría")
    solo_musica = merch_service.get_products_by_category("Música")
    print(f"✅ Filtro 'Música' encontró {len(solo_musica)} item(s).")

    # 4. COMPRA: El núcleo del servicio
    print("\n🛒 Bloque 3: Proceso de Compra (Transacción)")
    # Compramos 3 gorras
    cantidad = 3
    compra = merch_service.purchase_merch(user_id=user_id, merch_id=p2['id'], quantity=cantidad)
    
    print(f"✅ Compra realizada con éxito!")
    print(f"   - Producto: {p2['name']}")
    print(f"   - Cantidad: {compra['quantity']}")
    print(f"   - Total calculado por Service: {compra['total_price']}€")

    # 5. HISTORIAL: Verificación de pedidos del usuario
    print("\n📋 Bloque 4: Verificación de Historial de Usuario")
    pedidos = merch_service.get_user_orders(user_id)
    
    if len(pedidos) > 0:
        ultimo_pedido = pedidos[0]
        print(f"✅ Historial recuperado para el usuario.")
        print(f"   - Último pedido: {ultimo_pedido['product_name']} ({ultimo_pedido['status']})")
        
        # Verificación de integridad: ¿El total coincide?
        total_esperado = p2['price'] * cantidad
        if ultimo_pedido['total_price'] == total_esperado:
            print("   💎 INTEGRIDAD DE PRECIOS: OK")
        else:
            print(f"   ❌ ERROR DE CÁLCULO: Esperado {total_esperado}, obtenido {ultimo_pedido['total_price']}")
    else:
        print("❌ ERROR: El historial de pedidos está vacío.")

    # 6. EDGE CASE: Intentar comprar producto inexistente
    print("\n⚠️ Bloque 5: Pruebas de Error (Robustez)")
    try:
        merch_service.purchase_merch(user_id, "id-fantasma-123")
        print("❌ FAIL: El servicio permitió comprar un producto que no existe.")
    except ValueError as ve:
        print(f"✅ PASS: Error controlado correctamente: {ve}")

except Exception as e:
    print(f"💥 Error crítico durante el test: {e}")
    import traceback
    traceback.print_exc()

print("\n--- FIN DE LAS PRUEBAS DE SERVICIO ---")