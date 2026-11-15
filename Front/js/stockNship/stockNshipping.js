document.addEventListener("DOMContentLoaded", () => {
    // Referencias a las pestañas y secciones de inventario y logística en admin.html
    const tabInventory = document.getElementById("tab-inventory");
    const tabShipping = document.getElementById("tab-shipping");
    const stockTableBody = document.getElementById("stock-table-body");
    const shippingTableBody = document.getElementById("shipping-table-body");

    // Si no estamos en una página que tenga estas tablas, no ejecutamos nada
    if (!stockTableBody || !shippingTableBody) return;

    // Escuchar clics en las pestañas del panel de administración
    if (tabInventory) {
        tabInventory.addEventListener("click", cargarInventarioAdmin);
    }
    if (tabShipping) {
        tabShipping.addEventListener("click", cargarEnviosAdmin);
    }

    // ==========================================
    // 1. EVENTOS Y RENDERIZADO DE INVENTARIO (STOCK)
    // ==========================================
    async function cargarInventarioAdmin() {
        stockTableBody.innerHTML = `<tr><td colspan="6">Cargando inventario...</td></tr>`;
        try {
            const productos = await InventoryShippingAPI.obtenerStock();
            stockTableBody.innerHTML = "";

            if (!productos || productos.length === 0) {
                stockTableBody.innerHTML = `<tr><td colspan="6">No hay productos registrados en almacén.</td></tr>`;
                return;
            }

            productos.forEach(prod => {
                const tr = document.createElement("tr");
                tr.className = "table-row";
                tr.innerHTML = `
                    <td class="table-cell">${prod.nombre_producto}</td>
                    <td class="table-cell">${prod.variante || "-"}</td>
                    <td class="table-cell">${prod.ubicacion_almacen || "-"}</td>
                    <td class="table-cell">${prod.precio.toFixed(2)} €</td>
                    <td class="table-cell"><strong>${prod.unidades_disponibles}</strong></td>
                    <td class="table-cell">
                        <input type="number" class="stock-delta-input" value="1" style="width: 60px;">
                        <button type="button" class="btn-primary btn-apply-stock">Ajustar</button>
                    </td>
                `;

                // Evento para sumar o restar unidades físicas (PUT /inventario/{id_producto})
                tr.querySelector(".btn-apply-stock").addEventListener("click", async () => {
                    const inputDelta = tr.querySelector(".stock-delta-input");
                    const delta = parseInt(inputDelta.value, 10);
                    
                    if (isNaN(delta) || delta === 0) {
                        alert("Introduce una cantidad válida (positiva o negativa).");
                        return;
                    }

                    try {
                        await InventoryShippingAPI.actualizarStockAdmin(prod.id_producto, delta);
                        cargarInventarioAdmin(); // Recargar tabla con el stock actualizado
                    } catch (err) {
                        alert(`Error actualizando stock: ${err.detalle}`);
                    }
                });

                stockTableBody.appendChild(tr);
            });
        } catch (err) {
            stockTableBody.innerHTML = `<tr><td colspan="6">Error cargando stock: ${err.detalle}</td></tr>`;
        }
    }

    // ==========================================
    // 2. EVENTOS Y RENDERIZADO DE ENVÍOS Y TRACKING
    // ==========================================
    async function cargarEnviosAdmin() {
        shippingTableBody.innerHTML = `<tr><td colspan="5">Cargando envíos...</td></tr>`;
        try {
            const envios = await InventoryShippingAPI.obtenerEnvios();
            shippingTableBody.innerHTML = "";

            if (!envios || envios.length === 0) {
                shippingTableBody.innerHTML = `<tr><td colspan="5">No hay envíos pendientes.</td></tr>`;
                return;
            }

            const estadosPosibles = ["Pendiente", "Preparando", "Enviado", "En Reparto", "Entregado", "Incidencia"];

            envios.forEach(env => {
                const tr = document.createElement("tr");
                tr.className = "table-row";

                const opcionesHtml = estadosPosibles.map(est => 
                    `<option value="${est}" ${env.estado_envio === est ? "selected" : ""}>${est}</option>`
                ).join("");

                tr.innerHTML = `
                    <td class="table-cell">${env.id_envio}<br><small>Pedido: ${env.id_pedido}</small></td>
                    <td class="table-cell">${env.direccion_entrega}</td>
                    <td class="table-cell">
                        <span>${env.empresa_transporte || "Sin asignar"}</span><br>
                        <input type="text" class="tracking-input" value="${env.tracking_number || ""}" placeholder="Nº Tracking">
                    </td>
                    <td class="table-cell"><span class="status-badge">${env.estado_envio}</span></td>
                    <td class="table-cell">
                        <select class="shipping-status-select">${opcionesHtml}</select>
                        <button type="button" class="btn-primary btn-update-shipping">Guardar</button>
                    </td>
                `;

                // Evento para actualizar estado logístico (PUT /envios/{id_envio}/tracking)
                tr.querySelector(".btn-update-shipping").addEventListener("click", async () => {
                    const nuevoEstado = tr.querySelector(".shipping-status-select").value;
                    const tracking = tr.querySelector(".tracking-input").value.trim() || null;

                    try {
                        await InventoryShippingAPI.actualizarTracking(env.id_envio, nuevoEstado, tracking);
                        alert("Estado logístico y tracking actualizados.");
                        cargarEnviosAdmin(); // Recargar tabla
                    } catch (err) {
                        alert(`Error actualizando envío: ${err.detalle}`);
                    }
                });

                shippingTableBody.appendChild(tr);
            });
        } catch (err) {
            shippingTableBody.innerHTML = `<tr><td colspan="5">Error cargando envíos: ${err.detalle}</td></tr>`;
        }
    }
});