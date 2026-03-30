from app.services.merch_service import MerchService

merch_service = MerchService()

try:
    print("📦 Añadiendo producto via Servicio...")
    nuevo_item = merch_service.add_product_to_catalog(
        name="Camiseta Edición Limitada",
        price=29.99,
        category="Ropa",
        image="tshirt_2026.jpg"
    )
    print(f"✅ Producto creado: {nuevo_item['name']} con ID {nuevo_item['id']}")

    print("\n🛒 Consultando catálogo formateado...")
    catalogo = merch_service.get_full_catalog()
    for prod in catalogo:
        print(f"- {prod['name']}: {prod['formatted_price']} [{prod['category']}]")

except Exception as e:
    print(f"❌ Error en MerchService: {e}")