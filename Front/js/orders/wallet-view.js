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

    const qrViewerPanel = document.getElementById("qr-viewer-panel");
    const btnCloseQr = document.getElementById("btn-close-qr");
    const qrCanvasContainer = document.getElementById("qr-canvas-container");
    const qrRawTokenInput = document.getElementById("qr-raw-token");
    const btnCancelTicket = document.getElementById("btn-cancel-ticket");

    const staffScannerSection = document.getElementById("staff-scanner-section");
    const formValidateQr = document.getElementById("form-validate-qr");
    const scanResultBox = document.getElementById("scan-result-box");

    let entradaActualId = null;

    // Mostrar panel de validación en puerta si es Admin
    if (SessionManager.isAdmin()) {
        staffScannerSection.hidden = false;
    }

    btnLogout.addEventListener("click", () => SessionManager.clearSession());

    // ==========================================
    // 2. CARGAR LISTADO DE ENTRADAS DEL USUARIO
    // ==========================================
    async function cargarMisEntradas() {
        ticketsGrid.innerHTML = `<p class="loading-text">Cargando tus entradas...</p>`;
        try {
            const entradas = await WalletAPI.obtenerMisEntradas();
            
            if (!entradas || entradas.length === 0) {
                ticketsGrid.innerHTML = `<p class="empty-msg">Aún no has adquirido ninguna entrada.</p>`;
                return;
            }

            ticketsGrid.innerHTML = "";
            entradas.forEach(ent => {
                const card = document.createElement("div");
                card.className = "item-card ticket-card";
                const esValida = ent.estado === "Valida";

                card.innerHTML = `
                    <h3 class="card-title">Festival: ${ent.id_festival}</h3>
                    <p class="card-meta">Modalidad: <strong>${ent.tipo}</strong></p>
                    <p class="card-meta">Compra: ${new Date(ent.fecha_compra).toLocaleDateString()}</p>
                    <p class="card-status">Estado: <span class="status-badge">${ent.estado}</span></p>
                    <button type="button" class="btn-primary btn-open-qr" ${!esValida ? "disabled" : ""}>
                        ${esValida ? "Mostrar Código QR" : "Pase no disponible"}
                    </button>
                `;

                if (esValida) {
                    card.querySelector(".btn-open-qr").addEventListener("click", () => abrirVisorQR(ent));
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

        ticketsSection.hidden = true;
        qrViewerPanel.hidden = false;

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

    btnCloseQr.addEventListener("click", () => {
        entradaActualId = null;
        qrViewerPanel.hidden = true;
        ticketsSection.hidden = false;
        ocultarMensaje();
    });

    // ==========================================
    // 4. SOLICITAR CANCELACIÓN DE ENTRADA
    // ==========================================
    btnCancelTicket.addEventListener("click", async () => {
        if (!entradaActualId) return;
        if (!confirm("¿Seguro que deseas cancelar esta entrada y solicitar su devolución?")) return;

        try {
            const res = await WalletAPI.solicitarCancelacion(entradaActualId);
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

    // Arrancar vista
    cargarMisEntradas();
});