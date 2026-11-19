document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificar sesión activa
    if (!SessionManager.isAuthenticated()) {
        window.location.href = "./login.html";
        return;
    }

    // Referencias del DOM
    const btnLogout = document.getElementById("btn-logout");
    const msgBox = document.getElementById("wallet-message-box");
    const msgText = document.getElementById("wallet-message-text");

    const ticketsSection = document.getElementById("wallet-tickets-section");
    const ticketsGrid = document.getElementById("tickets-grid");
    const spacesSection = document.getElementById("wallet-spaces-section");
    const spacesGrid = document.getElementById("spaces-rentals-grid");
    const merchSection = document.getElementById("wallet-merch-section");

    const qrViewerPanel = document.getElementById("qr-viewer-panel");
    const btnCloseQr = document.getElementById("btn-close-qr");
    const qrCanvasContainer = document.getElementById("qr-canvas-container");
    const qrRawTokenInput = document.getElementById("qr-raw-token");
    const btnCancelTicket = document.getElementById("btn-cancel-ticket");

    const staffScannerSection = document.getElementById("staff-scanner-section");
    const formValidateQr = document.getElementById("form-validate-qr");
    const scanResultBox = document.getElementById("scan-result-box");

    let entradaActualId = null;
    let entradaActualObj = null;
    let espacioActualAlquiler = null;

    // Mostrar panel de validación en puerta si es Admin
    if (SessionManager.isAdmin()) {
        staffScannerSection.hidden = false;
    }

    btnLogout.addEventListener("click", () => SessionManager.clearSession());

    // ==========================================
    // 2. CARGAR LISTADO DE ENTRADAS DEL USUARIO
    // ==========================================
    function obtenerEntradasOcultas() {
        const user = SessionManager.getUser();
        const userKey = user && (user.id || user.email) ? (user.id || user.email) : "default";
        return JSON.parse(localStorage.getItem(`subsonic_hidden_tickets_${userKey}`)) || [];
    }

    function ocultarEntradaCancelada(idEntrada) {
        const user = SessionManager.getUser();
        const userKey = user && (user.id || user.email) ? (user.id || user.email) : "default";
        const ocultas = obtenerEntradasOcultas();
        if (!ocultas.includes(idEntrada)) {
            ocultas.push(idEntrada);
            localStorage.setItem(`subsonic_hidden_tickets_${userKey}`, JSON.stringify(ocultas));
        }
    }

    async function cargarMisEntradas() {
        ticketsGrid.innerHTML = `<p class="loading-text">Cargando tus entradas...</p>`;
        try {
            const todasLasEntradas = await WalletAPI.obtenerMisEntradas();
            const ocultas = obtenerEntradasOcultas();
            const entradas = (todasLasEntradas || []).filter(e => !ocultas.includes(e.id_entrada));
            
            if (entradas.length === 0) {
                ticketsGrid.innerHTML = `<p class="empty-msg">Aún no has adquirido ninguna entrada.</p>`;
                return;
            }

            ticketsGrid.innerHTML = "";
            entradas.forEach(ent => {
                const card = document.createElement("div");
                const esValida = ent.estado === "Valida";
                card.className = `item-card ticket-card ${!esValida ? "cancelled-card" : ""}`;

                card.innerHTML = `
                    <div class="card-content-wrap">
                        <h3 class="card-title">Festival: ${ent.id_festival}</h3>
                        <p class="card-meta">Modalidad: <strong>${ent.tipo}</strong></p>
                        <p class="card-meta">Compra: ${new Date(ent.fecha_compra).toLocaleDateString()}</p>
                        <p class="card-status">Estado: <span class="status-badge ${esValida ? "success" : "error"}">${ent.estado}</span></p>
                        <button type="button" class="btn-primary btn-open-qr" ${!esValida ? "disabled" : ""}>
                            ${esValida ? "Mostrar Código QR" : "Pase no disponible"}
                        </button>
                    </div>
                    ${!esValida ? `
                    <div class="delete-overlay">
                        <button type="button" class="btn-remove-cancelled">🗑 Eliminar Entrada</button>
                    </div>
                    ` : ""}
                `;

                if (esValida) {
                    card.querySelector(".btn-open-qr").addEventListener("click", () => abrirVisorQR(ent));
                } else {
                    card.querySelector(".btn-remove-cancelled").addEventListener("click", () => {
                        ocultarEntradaCancelada(ent.id_entrada);
                        card.remove();
                        if (ticketsGrid.children.length === 0) {
                            ticketsGrid.innerHTML = `<p class="empty-msg">Aún no has adquirido ninguna entrada.</p>`;
                        }
                    });
                }

                ticketsGrid.appendChild(card);
            });
        } catch (err) {
            ticketsGrid.innerHTML = `<p class="error-text">Error al cargar entradas: ${err.detalle}</p>`;
        }
    }

    // ==========================================
    // 3. OBTENER TOKEN Y RENDERIZAR CÓDIGO QR
    // ==========================================
    async function abrirVisorQR(entrada) {
        ocultarMensaje();
        entradaActualId = entrada.id_entrada;
        entradaActualObj = entrada;
        espacioActualAlquiler = null;

        ticketsSection.hidden = true;
        if (spacesSection) spacesSection.hidden = true;
        if (merchSection) merchSection.hidden = true;
        qrViewerPanel.hidden = false;

        btnCloseQr.textContent = "← Volver a mis entradas";
        const qrTitle = qrViewerPanel.querySelector(".detail-title");
        if (qrTitle) qrTitle.textContent = "Pase de Acceso Digital";
        btnCancelTicket.textContent = "Solicitar Cancelación / Devolución";

        document.getElementById("qr-ticket-id").textContent = entrada.id_entrada;
        document.getElementById("qr-festival-id").textContent = entrada.id_festival;
        document.getElementById("qr-ticket-type").textContent = entrada.tipo;
        
        qrCanvasContainer.innerHTML = `<p class="loading-text">Generando código QR...</p>`;
        qrRawTokenInput.value = "";
        document.getElementById("qr-expiration").textContent = "-";

        try {
            const datosQR = await WalletAPI.obtenerTokenQR(entrada.id_entrada);
            
            qrRawTokenInput.value = datosQR.token_qr;
            document.getElementById("qr-expiration").textContent = new Date(datosQR.fecha_expiracion).toLocaleString();

            // Limpiar contenedor y dibujar QR con qrcode.min.js
            qrCanvasContainer.innerHTML = "";
            new QRCode(qrCanvasContainer, {
                text: datosQR.token_qr,
                width: 200,
                height: 200
            });
        } catch (err) {
            qrCanvasContainer.innerHTML = `<p class="error-text">No se pudo generar el QR.</p>`;
            mostrarMensaje(err.detalle || "Error al obtener el token QR.", true);
        }
    }

    function abrirVisorQREspacio(alq) {
        ocultarMensaje();
        entradaActualId = null;
        entradaActualObj = null;
        espacioActualAlquiler = alq;

        if (ticketsSection) ticketsSection.hidden = true;
        if (spacesSection) spacesSection.hidden = true;
        if (merchSection) merchSection.hidden = true;
        qrViewerPanel.hidden = false;

        btnCloseQr.textContent = "← Volver a mis espacios";
        const qrTitle = qrViewerPanel.querySelector(".detail-title");
        if (qrTitle) qrTitle.textContent = "Acreditación Digital de Espacio (Proveedor)";
        btnCancelTicket.textContent = "Solicitar Cancelación de Espacio / Devolución";

        document.getElementById("qr-ticket-id").textContent = `${alq.id_contrato} (Espacio: ${alq.id_espacio})`;
        document.getElementById("qr-festival-id").textContent = alq.nombre_festival || alq.id_festival;
        document.getElementById("qr-ticket-type").textContent = `${(alq.tipo_espacio || "").toUpperCase()} (${alq.metros_cuadrados} m²) - ${alq.nombre_negocio}`;

        const tokenSimulado = btoa(JSON.stringify({
            contrato: alq.id_contrato,
            espacio: alq.id_espacio,
            festival: alq.id_festival,
            negocio: alq.nombre_negocio,
            exp: Date.now() + 3600000
        }));
        const expDate = new Date(Date.now() + 3600000).toLocaleString();

        qrRawTokenInput.value = `subsonic.space.${tokenSimulado}`;
        document.getElementById("qr-expiration").textContent = expDate;

        qrCanvasContainer.innerHTML = "";
        new QRCode(qrCanvasContainer, {
            text: `subsonic.space.${tokenSimulado}`,
            width: 200,
            height: 200
        });
    }

    btnCloseQr.addEventListener("click", () => {
        entradaActualId = null;
        entradaActualObj = null;
        espacioActualAlquiler = null;
        qrViewerPanel.hidden = true;
        if (SessionManager.isSupplier()) {
            if (spacesSection) spacesSection.hidden = false;
        } else {
            if (ticketsSection) ticketsSection.hidden = false;
        }
        if (merchSection) merchSection.hidden = false;
        ocultarMensaje();
    });

    // ==========================================
    // 4. SOLICITAR CANCELACIÓN DE ENTRADA O ESPACIO
    // ==========================================
    btnCancelTicket.addEventListener("click", async () => {
        // Caso Proveedor: Cancelar Espacio Alquilado
        if (espacioActualAlquiler) {
            if (!confirm("¿Seguro que deseas cancelar el alquiler de este espacio y solicitar su devolución?")) return;

            try {
                try {
                    await apiRequest(`/espacios/${espacioActualAlquiler.id_espacio}/alquileres/cancelar`, {
                        method: "POST"
                    });
                } catch (_) {
                    // Continuar actualizando estado aunque el backend ya lo hubiera liberado
                }

                const user = SessionManager.getUser();
                const userKey = user && (user.id || user.email) ? (user.id || user.email) : "default";
                const storageKey = `subsonic_space_rentals_${userKey}`;
                const alquileres = JSON.parse(localStorage.getItem(storageKey)) || [];

                const actualizado = alquileres.map(a => {
                    if (a.id_contrato === espacioActualAlquiler.id_contrato) {
                        return { ...a, estado: "CANCELADO" };
                    }
                    return a;
                });
                localStorage.setItem(storageKey, JSON.stringify(actualizado));

                mostrarMensaje("Alquiler de espacio cancelado y parcela liberada.", false);
                btnCloseQr.click();
                cargarMisEspaciosProveedor();
            } catch (err) {
                mostrarMensaje(err.detalle || "No se pudo cancelar el alquiler del espacio.", true);
            }
            return;
        }

        // Caso Cliente: Cancelar Entrada
        if (!entradaActualId) return;
        if (!confirm("¿Seguro que deseas cancelar esta entrada y solicitar su devolución?")) return;

        try {
            const res = await WalletAPI.solicitarCancelacion(entradaActualId);

            // Devolver +1 al cupo disponible de ese tipo de entrada en CatalogService
            if (entradaActualObj && entradaActualObj.id_festival) {
                const rawTipo = (entradaActualObj.tipo || "day").toLowerCase();
                let tipoCatalogo = "day";
                if (rawTipo.includes("vip")) {
                    tipoCatalogo = "vip";
                } else if (rawTipo.includes("weekend") || rawTipo.includes("abono")) {
                    tipoCatalogo = "weekend";
                }

                try {
                    await apiRequest(`/festivales/${entradaActualObj.id_festival}/entradas/liberar`, {
                        method: "POST",
                        body: JSON.stringify({
                            tipo_entrada: tipoCatalogo,
                            cantidad: 1
                        })
                    });
                } catch (_) {
                    // Continuar aunque el catálogo no pudiera actualizarse
                }
            }

            mostrarMensaje(`Solicitud registrada: ${res.estado_devolucion}`, false);
            btnCloseQr.click();
            cargarMisEntradas();
        } catch (err) {
            mostrarMensaje(err.detalle || "No se pudo cancelar la entrada.", true);
        }
    });

    // ==========================================
    // 5. VALIDACIÓN EN PUERTA (STAFF / ADMIN)
    // ==========================================
    formValidateQr.addEventListener("submit", async (e) => {
        e.preventDefault();
        scanResultBox.hidden = true;

        const token = document.getElementById("scan-token-input").value.trim();
        if (!token) return;

        const statusBadge = document.getElementById("scan-result-status");
        const resultMsg = document.getElementById("scan-result-msg");

        try {
            const res = await WalletAPI.validarQRStaff(token);
            statusBadge.textContent = res.estado_acceso ? "ACCESO PERMITIDO" : "DENEGADO";
            statusBadge.className = res.estado_acceso ? "status-badge success" : "status-badge error";
            resultMsg.textContent = res.mensaje;
            scanResultBox.hidden = false;
            
            // Refrescar lista por si el admin validó su propia entrada de prueba
            cargarMisEntradas();
        } catch (err) {
            statusBadge.textContent = "ACCESO DENEGADO";
            statusBadge.className = "status-badge error";
            resultMsg.textContent = err.detalle || "QR inválido o ya escaneado.";
            scanResultBox.hidden = false;
        }
    });

    // ==========================================
    // AUXILIARES DE MENSAJES
    // ==========================================
    function mostrarMensaje(texto, esError = true) {
        msgText.textContent = texto;
        msgBox.className = esError ? "alert-box error-box" : "alert-box success-box";
        msgBox.hidden = false;
    }

    function ocultarMensaje() {
        msgBox.hidden = true;
        msgText.textContent = "";
    }

    // ==========================================
    // 6. CARGAR MIS PEDIDOS DE MERCHANDISING Y SU ESTADO DE ENVÍO EN TIEMPO REAL
    // ==========================================
    async function cargarMisPedidosMerch() {
        const merchGrid = document.getElementById("merch-orders-grid");
        if (!merchGrid) return;

        const user = SessionManager.getUser();
        const userKey = user && (user.id || user.email) ? (user.id || user.email) : "default";
        const pedidos = JSON.parse(localStorage.getItem(`subsonic_merch_orders_${userKey}`)) || [];

        if (pedidos.length === 0) {
            merchGrid.innerHTML = `<p class="empty-msg">Aún no has adquirido ningún producto de merchandising.</p>`;
            return;
        }

        merchGrid.innerHTML = "";

        for (const ped of pedidos) {
            let estadoEnvio = "Pendiente";
            let trackingNumber = "Pendiente de asignación";
            let empresaTransporte = "Correos Express";
            let direccion = ped.direccion_entrega || "-";

            // Consultar el estado real actualizado en ShipInventoryService (PostgreSQL)
            try {
                const envioReal = await apiRequest(`/envios/pedido/${ped.id_pedido}`, { method: "GET" });
                if (envioReal) {
                    estadoEnvio = envioReal.estado_envio || estadoEnvio;
                    trackingNumber = envioReal.tracking_number || trackingNumber;
                    empresaTransporte = envioReal.empresa_transporte || empresaTransporte;
                    if (envioReal.direccion_entrega && envioReal.direccion_entrega !== "Dirección pendiente de confirmación") {
                        direccion = envioReal.direccion_entrega;
                    }
                }
            } catch (_) {
                // Si RabbitMQ aún está procesándolo (tarda 1-2s), mostramos Pendiente
            }

            const itemsHtml = (ped.items || [])
                .map(i => `<li>${i.cantidad}x <strong>${i.nombre_producto || i.id_producto}</strong> (${(i.precio_unitario || 0).toFixed(2)} €)</li>`)
                .join("");

            const card = document.createElement("div");
            card.className = "item-card ticket-card";
            card.innerHTML = `
                <h3 class="card-title">📦 Pedido Merchandising</h3>
                <p class="card-meta">ID Pedido: <small class="mono-text">${ped.id_pedido}</small></p>
                <p class="card-meta">Fecha: ${new Date(ped.fecha_compra).toLocaleString()}</p>
                <ul style="margin: 0.5rem 0; padding-left: 1.2rem;">${itemsHtml}</ul>
                <p class="card-meta">Dirección: ${direccion}</p>
                <p class="card-meta">Transporte: <strong>${empresaTransporte}</strong> | Tracking: <strong>${trackingNumber}</strong></p>
                <p class="card-status">Estado del Envío: <span class="status-badge">${estadoEnvio}</span></p>
            `;
            merchGrid.appendChild(card);
        }
    }

    // ==========================================
    // 7. CARGAR MIS ESPACIOS ALQUILADOS (PROVEEDORES)
    // ==========================================
    function eliminarEspacioCancelado(idContrato) {
        const user = SessionManager.getUser();
        const userKey = user && (user.id || user.email) ? (user.id || user.email) : "default";
        const storageKey = `subsonic_space_rentals_${userKey}`;
        const alquileres = JSON.parse(localStorage.getItem(storageKey)) || [];
        const filtrados = alquileres.filter(a => a.id_contrato !== idContrato);
        localStorage.setItem(storageKey, JSON.stringify(filtrados));
    }

    function cargarMisEspaciosProveedor() {
        if (!spacesGrid) return;

        const user = SessionManager.getUser();
        const userKey = user && (user.id || user.email) ? (user.id || user.email) : "default";
        const alquileres = JSON.parse(localStorage.getItem(`subsonic_space_rentals_${userKey}`)) || [];

        if (alquileres.length === 0) {
            spacesGrid.innerHTML = `<p class="empty-msg">Aún no has alquilado ningún espacio o parcela en los festivales.</p>`;
            return;
        }

        spacesGrid.innerHTML = "";
        alquileres.forEach(alq => {
            const card = document.createElement("div");
            const estadoActual = (alq.estado || "CONFIRMADO").toUpperCase();
            const esActivo = estadoActual !== "CANCELADO";
            card.className = `item-card ticket-card ${!esActivo ? "cancelled-card" : ""}`;

            card.innerHTML = `
                <div class="card-content-wrap">
                    <h3 class="card-title">🎪 Parcela: ${(alq.tipo_espacio || "").toUpperCase()} (${alq.metros_cuadrados} m²)</h3>
                    <p class="card-meta">Festival: <strong>${alq.nombre_festival || alq.id_festival}</strong></p>
                    <p class="card-meta">ID Contrato: <small class="mono-text">${alq.id_contrato}</small></p>
                    <p class="card-meta">ID Espacio: <small class="mono-text">${alq.id_espacio}</small></p>
                    <p class="card-meta">Negocio: <strong>${alq.nombre_negocio}</strong> (${alq.tipo_negocio})</p>
                    <p class="card-meta">Conexión Eléctrica: <strong>${alq.necesita_conexion_electrica ? "Sí (Incluida)" : "No"}</strong></p>
                    <p class="card-meta">Importe Pagado: <strong class="ticket-price" style="font-size:1.1rem;">${Number(alq.precio_alquiler || 0).toFixed(2)} €</strong></p>
                    <p class="card-status">Estado Contrato: <span class="status-badge ${esActivo ? "success" : "error"}">${estadoActual}</span></p>
                    <button type="button" class="btn-primary btn-open-qr" ${!esActivo ? "disabled" : ""}>
                        ${esActivo ? "Mostrar Código QR" : "Contrato cancelado"}
                    </button>
                </div>
                ${!esActivo ? `
                <div class="delete-overlay">
                    <button type="button" class="btn-remove-cancelled">🗑 Eliminar Espacio</button>
                </div>
                ` : ""}
            `;

            if (esActivo) {
                card.querySelector(".btn-open-qr").addEventListener("click", () => abrirVisorQREspacio(alq));
            } else {
                card.querySelector(".btn-remove-cancelled").addEventListener("click", () => {
                    eliminarEspacioCancelado(alq.id_contrato);
                    card.remove();
                    if (spacesGrid.children.length === 0) {
                        spacesGrid.innerHTML = `<p class="empty-msg">Aún no has alquilado ningún espacio o parcela en los festivales.</p>`;
                    }
                });
            }

            spacesGrid.appendChild(card);
        });
    }

    // Arrancar vista según rol (Proveedor vs Cliente)
    if (SessionManager.isSupplier()) {
        const walletLink = document.querySelector('a[href="./wallet.html"]');
        if (walletLink) walletLink.textContent = "Mis Espacios";
        const pageTitle = document.querySelector(".page-title");
        if (pageTitle) pageTitle.textContent = "Mis Espacios y Pedidos (Proveedor)";

        if (ticketsSection) ticketsSection.hidden = true;
        if (spacesSection) spacesSection.hidden = false;
        cargarMisEspaciosProveedor();
        cargarMisPedidosMerch();
    } else {
        if (spacesSection) spacesSection.hidden = true;
        cargarMisEntradas();
        cargarMisPedidosMerch();
    }
});