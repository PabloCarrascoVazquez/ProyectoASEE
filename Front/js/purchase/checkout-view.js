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
    const ticketsCartGroup = document.getElementById("tickets-cart-group");
    const spacesCartGroup = document.getElementById("spaces-cart-group");
    const merchCartGroup = document.getElementById("merch-cart-group");
    const cartFestivalIdSpan = document.getElementById("cart-festival-id");
    const cartTicketsList = document.getElementById("cart-tickets-list");
    const cartSpacesList = document.getElementById("cart-spaces-list");
    const cartMerchList = document.getElementById("cart-merch-list");
    const shippingAddressPanel = document.getElementById("shipping-address-panel");
    const businessDetailsPanel = document.getElementById("business-details-panel");
    const btnClearCart = document.getElementById("btn-clear-cart");
    const btnInitReservation = document.getElementById("btn-init-reservation");

    // Referencias del paso de pago y errores
    const formPayment = document.getElementById("form-payment");
    const errorBox = document.getElementById("checkout-error-box");
    const errorMsg = document.getElementById("checkout-error-msg");

    let transaccionActual = null;
    let reservaEspaciosPendiente = null;

    // Ajustar menú superior si es Proveedor
    if (SessionManager.isSupplier()) {
        const walletLink = document.querySelector('a[href="./wallet.html"]');
        if (walletLink) walletLink.textContent = "Mis Espacios";
    }

    // ==========================================
    // 2. LEER Y PINTAR EL CARRITO DESDE LOCALSTORAGE
    // ==========================================
    function obtenerCarrito() {
        const raw = JSON.parse(localStorage.getItem("subsonic_cart")) || {};
        return {
            id_festival: raw.id_festival || null,
            entradas: raw.entradas || [],
            merchandising: raw.merchandising || [],
            espacios: raw.espacios || []
        };
    }

    function pintarResumenCarrito() {
        ocultarError();
        const carrito = obtenerCarrito();
        const esProveedor = SessionManager.isSupplier();
        const tieneEntradas = carrito.entradas && carrito.entradas.length > 0;
        const tieneMerch = carrito.merchandising && carrito.merchandising.length > 0;
        const tieneEspacios = carrito.espacios && carrito.espacios.length > 0;

        if (esProveedor) {
            // El proveedor ve Espacios (y Merchandising si añadió alguno), no Entradas
            if (ticketsCartGroup) ticketsCartGroup.hidden = true;
            if (spacesCartGroup) spacesCartGroup.hidden = false;
            if (merchCartGroup) merchCartGroup.hidden = !tieneMerch;
        } else {
            // El cliente ve Entradas y Merchandising
            if (ticketsCartGroup) ticketsCartGroup.hidden = false;
            if (spacesCartGroup) spacesCartGroup.hidden = !tieneEspacios;
            if (merchCartGroup) merchCartGroup.hidden = false;
        }

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

        // Pintar lista de espacios (Proveedores)
        if (cartSpacesList) {
            cartSpacesList.innerHTML = "";
            if (!tieneEspacios) {
                cartSpacesList.innerHTML = `<li class="empty-msg">No hay espacios en el carrito.</li>`;
                if (businessDetailsPanel) businessDetailsPanel.hidden = true;
            } else {
                carrito.espacios.forEach(esp => {
                    const li = document.createElement("li");
                    li.className = "cart-item";
                    const precio = Number(esp.precio_alquiler || 0);
                    li.textContent = `1x Parcela ${esp.tipo.toUpperCase()} (${esp.metros_cuadrados} m²) [${esp.nombre_festival || esp.id_festival}] - ${precio.toFixed(2)} €`;
                    cartSpacesList.appendChild(li);
                });
                if (businessDetailsPanel) businessDetailsPanel.hidden = false;
            }
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
        btnInitReservation.disabled = (!tieneEntradas && !tieneMerch && !tieneEspacios);
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
        const tieneEspacios = carrito.espacios && carrito.espacios.length > 0;

        if (!tieneEntradas && !tieneMerch && !tieneEspacios) {
            mostrarError("El carrito está vacío.");
            return;
        }

        // Validar datos del negocio si hay espacios para alquilar
        let datosNegocio = null;
        if (tieneEspacios) {
            const nombreNegocio = document.getElementById("biz-name").value.trim();
            const tipoNegocio = document.getElementById("biz-type").value;
            const necesitaLuz = document.getElementById("biz-electric").checked;

            if (!nombreNegocio) {
                mostrarError("Por favor, indica el Nombre del Negocio para el contrato de alquiler del espacio.");
                return;
            }
            datosNegocio = {
                nombre_negocio: nombreNegocio,
                tipo_negocio: tipoNegocio,
                necesita_conexion_electrica: necesitaLuz
            };
        }

        const totalEspacios = tieneEspacios
            ? carrito.espacios.reduce((acc, s) => acc + Number(s.precio_alquiler || 0), 0)
            : 0;

        // Caso A: El carrito tiene SOLO espacios de alquiler (sin entradas ni merch)
        if (tieneEspacios && !tieneEntradas && !tieneMerch) {
            reservaEspaciosPendiente = {
                espacios: carrito.espacios,
                datosNegocio,
                totalEspacios
            };
            transaccionActual = {
                id_transaccion: "alq-" + Math.random().toString(36).substring(2, 10),
                estado: "PENDING",
                expiracion_reserva: new Date(Date.now() + 10 * 60000).toISOString(),
                total_pagar: totalEspacios,
                moneda: "EUR",
                soloEspacios: true
            };

            document.getElementById("tx-id").textContent = transaccionActual.id_transaccion;
            document.getElementById("tx-status").textContent = transaccionActual.estado;
            document.getElementById("tx-expiration").textContent = new Date(transaccionActual.expiracion_reserva).toLocaleTimeString();
            document.getElementById("tx-total").textContent = `${transaccionActual.total_pagar.toFixed(2)} EUR`;

            stepCart.hidden = true;
            stepPayment.hidden = false;
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

            if (tieneEspacios) {
                reservaEspaciosPendiente = {
                    espacios: carrito.espacios,
                    datosNegocio,
                    totalEspacios
                };
            } else {
                reservaEspaciosPendiente = null;
            }

            const totalCombinado = Number(reserva.total_pagar || 0) + totalEspacios;

            // Rellenar datos de la reserva en el Paso 2
            document.getElementById("tx-id").textContent = reserva.id_transaccion;
            document.getElementById("tx-status").textContent = reserva.estado;
            document.getElementById("tx-expiration").textContent = new Date(reserva.expiracion_reserva).toLocaleTimeString();
            document.getElementById("tx-total").textContent = `${totalCombinado.toFixed(2)} ${reserva.moneda || "EUR"}`;

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

            let recibo = null;

            // 1. Si hay reserva en PurchaseService (entradas o merch), confirmar pago allí
            if (!transaccionActual.soloEspacios) {
                recibo = await CheckoutAPI.confirmarPago(
                    transaccionActual.id_transaccion,
                    metodoPago,
                    tokenPasarela
                );
            }

            // 2. Si hay espacios de alquiler en el carrito, registrar cada alquiler en CatalogService y guardarlo en Mis Espacios
            const user = SessionManager.getUser();
            const userKey = user && (user.id || user.email) ? (user.id || user.email) : "default";

            if (reservaEspaciosPendiente && reservaEspaciosPendiente.espacios.length > 0) {
                const spaceStorageKey = `subsonic_space_rentals_${userKey}`;
                const alquileresGuardados = JSON.parse(localStorage.getItem(spaceStorageKey)) || [];
                let ultimoContratoId = null;

                for (const esp of reservaEspaciosPendiente.espacios) {
                    const resAlquiler = await CatalogAPI.solicitarAlquilerEspacio(
                        esp.id_espacio,
                        reservaEspaciosPendiente.datosNegocio
                    );
                    ultimoContratoId = resAlquiler.id_contrato || ("alq-" + Date.now());

                    alquileresGuardados.unshift({
                        id_contrato: ultimoContratoId,
                        id_espacio: esp.id_espacio,
                        id_festival: esp.id_festival,
                        nombre_festival: esp.nombre_festival || esp.id_festival,
                        tipo_espacio: esp.tipo,
                        metros_cuadrados: esp.metros_cuadrados,
                        precio_alquiler: Number(esp.precio_alquiler || 0),
                        nombre_negocio: reservaEspaciosPendiente.datosNegocio.nombre_negocio,
                        tipo_negocio: reservaEspaciosPendiente.datosNegocio.tipo_negocio,
                        necesita_conexion_electrica: reservaEspaciosPendiente.datosNegocio.necesita_conexion_electrica,
                        estado: "CONFIRMADO",
                        fecha_alquiler: new Date().toISOString()
                    });
                }
                localStorage.setItem(spaceStorageKey, JSON.stringify(alquileresGuardados));

                if (transaccionActual.soloEspacios) {
                    recibo = {
                        id_transaccion: ultimoContratoId || transaccionActual.id_transaccion,
                        estado: "PAID",
                        total_cobrado: reservaEspaciosPendiente.totalEspacios,
                        fecha_pago: new Date().toISOString(),
                        recibo_url: "#"
                    };
                } else if (recibo) {
                    recibo.total_cobrado = Number(recibo.total_cobrado || 0) + reservaEspaciosPendiente.totalEspacios;
                }
            }

            // 3. Si la compra incluye merchandising, guardar el pedido en el historial del usuario
            const carritoPagado = obtenerCarrito();
            if (carritoPagado.merchandising && carritoPagado.merchandising.length > 0) {
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
            document.getElementById("receipt-amount").textContent = `${Number(recibo.total_cobrado || 0).toFixed(2)} EUR`;
            document.getElementById("receipt-date").textContent = new Date(recibo.fecha_pago).toLocaleString();
            
            const linkRecibo = document.getElementById("receipt-url");
            linkRecibo.href = recibo.recibo_url || "#";

            // Ajustar texto del botón del recibo según si es Proveedor o Cliente
            const btnIrWallet = stepReceipt.querySelector('a[href="./wallet.html"]');
            if (btnIrWallet && SessionManager.isSupplier()) {
                btnIrWallet.textContent = "Ir a Mis Espacios";
            }

            // Mostrar recibo final
            stepPayment.hidden = true;
            stepReceipt.hidden = false;
        } catch (err) {
            mostrarError(err.detalle || "Error al procesar el pago o el espacio ya ha sido alquilado.");
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