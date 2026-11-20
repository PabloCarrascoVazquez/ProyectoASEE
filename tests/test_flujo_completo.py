import time
from playwright.sync_api import sync_playwright, expect

BASE_URL = "http://localhost:48080"

def test_flujo_completo_subsonic():
    timestamp = int(time.time())
    nombre_usuario = f"Laura Test {timestamp}"
    email_usuario = f"laura_{timestamp}@subsonic.com"
    password_usuario = "Subsonic2026!"

    with sync_playwright() as p:
        # headless=False abre el navegador visible; slow_mo=400 permite ver cada paso
        browser = p.chromium.launch(headless=False, slow_mo=400)
        context = browser.new_context()
        page = context.new_page()

        # Aceptar automáticamente cualquier window.alert() o window.confirm() del JS
        page.on("dialog", lambda dialog: (print(f"   [Alerta navegador]: {dialog.message}"), dialog.accept()))

        # =====================================================================
        # PASO 1: REGISTRO E INICIO DE SESIÓN (login.html)
        # =====================================================================
        print("\n1. Abriendo página de acceso y registro...")
        page.goto(f"{BASE_URL}/login.html")
        page.wait_for_load_state("networkidle")

        # Cambiar a la pestaña "Crear Cuenta"
        page.click("#btn-tab-register")
        expect(page.locator("#form-register")).to_be_visible()

        # Rellenar formulario de registro
        print(f"2. Registrando nuevo usuario: {email_usuario}...")
        page.fill("#reg-name", nombre_usuario)
        page.fill("#reg-email", email_usuario)
        page.fill("#reg-password", password_usuario)
        page.select_option("#reg-rol", "client")
        page.click("#form-register button[type='submit']")

        # Tras registrarse, login.js cambia automáticamente a #form-login y rellena #login-email
        expect(page.locator("#form-login")).to_be_visible(timeout=5000)

        print("3. Iniciando sesión con el usuario recién creado...")
        page.fill("#login-password", password_usuario)
        page.click("#form-login button[type='submit']")

        # Esperar redirección automática a index.html y saludo en cabecera
        page.wait_for_url("**/index.html", timeout=5000)
        expect(page.locator(".user-greeting")).to_contain_text(nombre_usuario)

        # =====================================================================
        # PASO 2: EXPLORAR CATÁLOGO Y AÑADIR ENTRADA AL CARRITO (index.html)
        # =====================================================================
        print("4. Explorando catálogo de festivales...")
        page.wait_for_selector(".festival-card", timeout=5000)
        num_festivales = page.locator(".festival-card").count()
        assert num_festivales > 0, "No se encontraron festivales en el catálogo."
        print(f"   -> {num_festivales} festivales cargados.")

        # Abrir detalle del primer festival
        page.locator(".festival-card .btn-view-festival").first.click()
        expect(page.locator("#festival-detail-view")).to_be_visible()

        # Añadir la primera tarifa de entrada disponible
        btn_entrada = page.locator("#detail-fest-tickets .btn-add-ticket:not([disabled])").first
        expect(btn_entrada).to_be_visible(timeout=5000)
        btn_entrada.click()

        # Verificar que el contador del carrito subió a 1
        expect(page.locator("#cart-count")).to_have_text("1")

        # =====================================================================
        # PASO 3: EXPLORAR MERCHANDISING Y AÑADIR PRODUCTO (index.html)
        # =====================================================================
        print("5. Cambiando a la tienda de Merchandising...")
        page.click("#btn-show-merch")
        expect(page.locator("#section-merch")).to_be_visible()

        page.wait_for_selector(".merch-card", timeout=5000)
        page.locator(".merch-card .btn-view-merch").first.click()
        expect(page.locator("#merch-detail-view")).to_be_visible()

        # Añadir 1 unidad al carrito si hay stock
        btn_add_merch = page.locator("#btn-add-merch-cart")
        if btn_add_merch.is_enabled():
            btn_add_merch.click()
            expect(page.locator("#cart-count")).to_have_text("2")
            tiene_merch = True
        else:
            print("   -> Producto sin stock, continuando solo con la entrada.")
            tiene_merch = False

        # =====================================================================
        # PASO 4: CHECKOUT, RESERVA DE STOCK Y PAGO (checkout.html)
        # =====================================================================
        print("6. Navegando al carrito (checkout.html)...")
        page.click('a[href="./checkout.html"]')
        page.wait_for_url("**/checkout.html")

        # Si hay merchandising en el carrito, rellenar dirección de envío obligatoria
        if tiene_merch:
            expect(page.locator("#shipping-address-panel")).to_be_visible()
            page.fill("#ship-street", "Avenida de la Música 42, 3ºA")
            page.fill("#ship-city", "Madrid")
            page.fill("#ship-zip", "28001")
            page.fill("#ship-country", "España")
            page.fill("#ship-phone", "+34600998877")

        print("7. Bloqueando stock (Reserva 10 min)...")
        page.click("#btn-init-reservation")

        # Esperar a que avance al Paso 2 (Pasarela de Pago)
        expect(page.locator("#checkout-step-payment")).to_be_visible(timeout=8000)
        tx_id = page.locator("#tx-id").inner_text()
        print(f"   -> Reserva creada con ID Transacción: {tx_id}")

        print("8. Confirmando pago...")
        page.select_option("#payment-method", "tarjeta")
        page.click("#btn-confirm-payment")

        # Esperar al Paso 3 (Recibo de compra)
        expect(page.locator("#checkout-step-receipt")).to_be_visible(timeout=8000)
        expect(page.locator("#receipt-status")).to_have_text("PAID")
        print("   -> Pago confirmado con estado PAID.")

        # =====================================================================
        # PASO 5: VERIFICAR WALLET Y GENERAR CÓDIGO QR (wallet.html)
        # =====================================================================
        print("9. Abriendo Billetera Digital (wallet.html)...")
        page.click('a[href="./wallet.html"]')
        page.wait_for_url("**/wallet.html")

        # Comprobar que la entrada aparece y abrir su Código QR
        page.wait_for_selector("#tickets-grid .ticket-card", timeout=8000)
        print("10. Abriendo pase digital y generando código QR...")
        page.locator("#tickets-grid .btn-open-qr").first.click()

        expect(page.locator("#qr-viewer-panel")).to_be_visible()
        # Esperar a que el input del token criptográfico se rellene
        expect(page.locator("#qr-raw-token")).not_to_have_value("", timeout=5000)
        token_qr = page.locator("#qr-raw-token").input_value()
        print(f"   -> Token QR generado correctamente ({len(token_qr)} caracteres).")

        if tiene_merch:
            page.click("#btn-close-qr")
            expect(page.locator("#merch-orders-grid .ticket-card").first).to_be_visible()
            print("   -> Pedido de merchandising visible en el historial de envíos.")

        print("\n✅ TODAS LAS PRUEBAS E2E DE SUBSONIC HAN PASADO CON ÉXITO.")
        page.wait_for_timeout(1500)
        browser.close()

if __name__ == "__main__":
    test_flujo_completo_subsonic()