document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificar sesión activa antes de permitir comprar
    if (!SessionManager.isAuthenticated()) {
        window.location.href = "./login.html";
        return;
    }

    // Referencias a los 3 pasos de la vista
    const stepCart = document.getElementById("checkout-step-cart");
    const stepPayment = document.getElementById("checkout-step-payment");
    const stepReceipt = document.getElementById("checkout-step-receipt");

    // Referencias del carrito y dirección
    const cartFestivalIdSpan = document.getElementById("cart-festival-id");
    const cartTicketsList = document.getElementById("cart-tickets-list");
    const cartMerchList = document.getElementById("cart-merch-list");
    const shippingAddressPanel = document.getElementById("shipping-address-panel");
    const btnClearCart = document.getElementById("btn-clear-cart");
    const btnInitReservation = document.getElementById("btn-init-reservation");

    // Referencias del paso de pago y errores
    const formPayment = document.getElementById("form-payment");
    const errorBox = document.getElementById("checkout-error-box");
    const errorMsg = document.getElementById("checkout-error-msg");

    let transaccionActual = null;

    // ==========================================
    // 2. LEER Y PINTAR EL CARRITO DESDE LOCALSTORAGE
    // ==========================================
    function obtenerCarrito() {
        return JSON.parse(localStorage.getItem("subsonic_cart")) || {
            id_festival: null,
            entradas: [],
            merchandising: []
        };
    }

    function pintarResumenCarrito() {
        ocultarError();
        const carrito = obtenerCarrito();
        const tieneEntradas = carrito.entradas && carrito.entradas.length > 0;
        const tieneMerch = carrito.merchandising && carrito.merchandising.length > 0;

        // Pintar cabecera del festival
        cartFestivalIdSpan.textContent = (tieneEntradas && carrito.id_festival) 
            ? carrito.id_festival 
            : "Ninguno";

        // Pintar lista de entradas
        cartTicketsList.innerHTML = "";
        if (!tieneEntradas) {
            cartTicketsList.innerHTML = `<li class="empty-msg">No hay entradas en el carrito.</li>`;
        } else {
            carrito.entradas.forEach(item => {
                const li = document.createElement("li");
                li.className = "cart-item";
                const subtotal = (item.precio_unitario || 0) * item.cantidad;
                li.textContent = `${item.cantidad}x Entrada ${item.tipo_entrada.toUpperCase()} - ${subtotal.toFixed(2)} €`;
                cartTicketsList.appendChild(li);
            });
        }

        // Pintar lista de merchandising
        cartMerchList.innerHTML = "";
        if (!tieneMerch) {
            cartMerchList.innerHTML = `<li class="empty-msg">No hay productos físicos en el carrito.</li>`;
            shippingAddressPanel.hidden = true;
        } else {
            carrito.merchandising.forEach(item => {
                const li = document.createElement("li");
                li.className = "cart-item";
                const subtotal = (item.precio_unitario || 0) * item.cantidad;
                li.textContent = `${item.cantidad}x ${item.nombre_producto || item.id_producto} - ${subtotal.toFixed(2)} €`;
                cartMerchList.appendChild(li);
            });
            // Mostrar dirección obligatoria solo si hay merchandising
            shippingAddressPanel.hidden = false;
        }

        // Desactivar botón de reserva si el carrito está completamente vacío
        btnInitReservation.disabled = (!tieneEntradas && !tieneMerch);
    }

    btnClearCart.addEventListener("click", () => {
        localStorage.removeItem("subsonic_cart");
        pintarResumenCarrito();
    });

    // ==========================================
    // 3. PASO 1 -> PASO 2: INICIAR RESERVA (BLOQUEO 10 MIN)
    // ==========================================
    btnInitReservation.addEventListener("click", async () => {
        ocultarError();
        const carrito = obtenerCarrito();
        const tieneEntradas = carrito.entradas && carrito.entradas.length > 0;
        const tieneMerch = carrito.merchandising && carrito.merchandising.length > 0;

        if (!tieneEntradas && !tieneMerch) {
            mostrarError("El carrito está vacío.");
            return;
        }

        // Construir payload limpio según ReservaCarritoCompletoRequest
        const payload = {};

        if (tieneEntradas) {
            payload.id_festival = carrito.id_festival;
            payload.entradas = carrito.entradas.map(e => ({
                tipo_entrada: e.tipo_entrada,
                cantidad: e.cantidad
            }));
        }

        if (tieneMerch) {
            const calle = document.getElementById("ship-street").value.trim();
            const ciudad = document.getElementById("ship-city").value.trim();
            const codigoPostal = document.getElementById("ship-zip").value.trim();
            const pais = document.getElementById("ship-country").value.trim();
            const telefono = document.getElementById("ship-phone").value.trim();

            if (!calle || !ciudad || !codigoPostal || !pais) {
                mostrarError("Por favor, completa todos los campos obligatorios de la dirección de envío.");
                return;
            }

            payload.merchandising = carrito.merchandising.map(m => ({
                id_producto: m.id_producto,
                cantidad: m.cantidad
            }));

            payload.direccion_envio = {
                calle,
                ciudad,
                codigo_postal: codigoPostal,
                pais,
                ...(telefono ? { telefono_contacto: telefono } : {})
            };
        }

        try {
            btnInitReservation.disabled = true;
            btnInitReservation.textContent = "Reservando stock...";

            const reserva = await CheckoutAPI.iniciarReserva(payload);
            transaccionActual = reserva;

            // Rellenar datos de la reserva en el Paso 2
            document.getElementById("tx-id").textContent = reserva.id_transaccion;
            document.getElementById("tx-status").textContent = reserva.estado;
            document.getElementById("tx-expiration").textContent = new Date(reserva.expiracion_reserva).toLocaleTimeString();
            document.getElementById("tx-total").textContent = `${reserva.total_pagar.toFixed(2)} ${reserva.moneda || "EUR"}`;

            // Avanzar al paso de pago
            stepCart.hidden = true;
            stepPayment.hidden = false;
        } catch (err) {
            mostrarError(err.detalle || "No se pudo bloquear el stock. Puede que esté agotado.");
        } finally {
            btnInitReservation.disabled = false;
            btnInitReservation.textContent = "Reservar Stock y Continuar al Pago";
        }
    });

    // ==========================================
    // 4. PASO 2 -> PASO 3: CONFIRMAR PAGO CON PASARELA
    // ==========================================
    formPayment.addEventListener("submit", async (e) => {
        e.preventDefault();
        ocultarError();

        if (!transaccionActual || !transaccionActual.id_transaccion) {
            mostrarError("No hay una reserva activa para pagar.");
            return;
        }

        const metodoPago = document.getElementById("payment-method").value;
        const tokenPasarela = document.getElementById("payment-token").value.trim();
        const btnConfirm = document.getElementById("btn-confirm-payment");

        try {
            btnConfirm.disabled = true;
            btnConfirm.textContent = "Procesando pago...";

            const recibo = await CheckoutAPI.confirmarPago(
                transaccionActual.id_transaccion,
                metodoPago,
                tokenPasarela
            );

            

            // Si la compra incluye merchandising, guardar el pedido en el historial del usuario
            const carritoPagado = obtenerCarrito();
            if (carritoPagado.merchandising && carritoPagado.merchandising.length > 0) {
                const user = SessionManager.getUser();
                const userKey = user && (user.id || user.email) ? (user.id || user.email) : "default";
                const storageKey = `subsonic_merch_orders_${userKey}`;
                const pedidosGuardados = JSON.parse(localStorage.getItem(storageKey)) || [];

                const calle = document.getElementById("ship-street").value.trim();
                const ciudad = document.getElementById("ship-city").value.trim();
                const cp = document.getElementById("ship-zip").value.trim();
                const pais = document.getElementById("ship-country").value.trim();

                pedidosGuardados.unshift({
                    id_pedido: recibo.id_transaccion,
                    fecha_compra: recibo.fecha_pago || new Date().toISOString(),
                    total: recibo.total_cobrado,
                    direccion_entrega: `${calle}, ${cp} ${ciudad}, ${pais}`,
                    items: carritoPagado.merchandising
                });
                localStorage.setItem(storageKey, JSON.stringify(pedidosGuardados));
            }

            // Vaciar el carrito tras completar la compra con éxito
            localStorage.removeItem("subsonic_cart");

            // Rellenar datos del recibo en el Paso 3
            document.getElementById("receipt-tx-id").textContent = recibo.id_transaccion;
            document.getElementById("receipt-status").textContent = recibo.estado;
            document.getElementById("receipt-amount").textContent = `${recibo.total_cobrado.toFixed(2)} EUR`;
            document.getElementById("receipt-date").textContent = new Date(recibo.fecha_pago).toLocaleString();
            
            const linkRecibo = document.getElementById("receipt-url");
            linkRecibo.href = recibo.recibo_url || "#";

            // Mostrar recibo final
            stepPayment.hidden = true;
            stepReceipt.hidden = false;
        } catch (err) {
            mostrarError(err.detalle || "Error al procesar el pago o reserva expirada.");
        } finally {
            btnConfirm.disabled = false;
            btnConfirm.textContent = "Pagar Ahora";
        }
    });

    // ==========================================
    // AUXILIARES DE MENSAJES DE ERROR
    // ==========================================
    function mostrarError(texto) {
        errorMsg.textContent = texto;
        errorBox.hidden = false;
    }

    function ocultarError() {
        errorBox.hidden = true;
        errorMsg.textContent = "";
    }

    // Inicializar vista
    pintarResumenCarrito();
});