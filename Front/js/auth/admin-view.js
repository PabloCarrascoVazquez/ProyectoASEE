document.addEventListener("DOMContentLoaded", () => {
    // 1. Verificar sesión y rol de administrador
    if (!SessionManager.isAuthenticated() || !SessionManager.isAdmin()) {
        alert("Acceso denegado. Se requieren permisos de administrador.");
        window.location.href = "./login.html";
        return;
    }

    document.getElementById("btn-logout").addEventListener("click", () => SessionManager.clearSession());

    // ==========================================
    // 2. NAVEGACIÓN ENTRE PESTAÑAS DEL PANEL
    // ==========================================
    const tabs = {
        festivals: { btn: document.getElementById("tab-festivals"), sec: document.getElementById("admin-section-festivals"), init: cargarFestivalesAdmin },
        artists:   { btn: document.getElementById("tab-artists"),   sec: document.getElementById("admin-section-artists"),   init: null },
        inventory: { btn: document.getElementById("tab-inventory"), sec: document.getElementById("admin-section-inventory"), init: cargarInventarioAdmin },
        shipping:  { btn: document.getElementById("tab-shipping"),  sec: document.getElementById("admin-section-shipping"),  init: cargarEnviosAdmin }
    };

    Object.keys(tabs).forEach(key => {
        tabs[key].btn.addEventListener("click", () => {
            Object.values(tabs).forEach(t => {
                t.btn.classList.remove("active");
                t.sec.hidden = true;
            });
            tabs[key].btn.classList.add("active");
            tabs[key].sec.hidden = false;
            if (tabs[key].init) tabs[key].init();
        });
    });

    // ==========================================
    // 3. MÓDULO DE FESTIVALES, ESPACIOS Y ENTRADAS
    // ==========================================
    const formFestival = document.getElementById("form-festival");
    const festIdInput = document.getElementById("fest-id");
    const btnCancelEditFest = document.getElementById("btn-cancel-edit-fest");
    const adminFestivalsGrid = document.getElementById("admin-festivals-grid");
    const subresourcesPanel = document.getElementById("festival-subresources-panel");
    
    let festivalSeleccionadoId = null;

    async function cargarFestivalesAdmin() {
        adminFestivalsGrid.innerHTML = `<p class="loading-text">Cargando festivales...</p>`;
        try {
            const festivales = await CatalogAPI.obtenerFestivales(); //[cite: 3]
            adminFestivalsGrid.innerHTML = "";

            if (!festivales || festivales.length === 0) {
                adminFestivalsGrid.innerHTML = `<p class="empty-msg">No hay festivales creados.</p>`;
                return;
            }

            festivales.forEach(fest => {
                const card = document.createElement("div");
                card.className = "admin-card festival-admin-card";
                card.innerHTML = `
                    <h4 class="card-title">${fest.nombre} (${fest.id_festival})</h4>
                    <p class="card-meta">${fest.fecha_inicio || ""} - ${fest.fecha_fin || ""} | ${fest.ubicacion || ""}</p>
                    <div class="card-actions">
                        <button type="button" class="btn-secondary btn-edit-fest">Editar</button>
                        <button type="button" class="btn-secondary btn-resources-fest">Espacios / Entradas</button>
                        <button type="button" class="btn-danger btn-delete-fest">Eliminar</button>
                    </div>
                `;

                // Cargar datos en formulario para editar
                card.querySelector(".btn-edit-fest").addEventListener("click", () => {
                    festIdInput.value = fest.id_festival; //[cite: 3]
                    document.getElementById("fest-name").value = fest.nombre; //[cite: 3]
                    document.getElementById("fest-start").value = fest.fecha_inicio || ""; //[cite: 3]
                    document.getElementById("fest-end").value = fest.fecha_fin || ""; //[cite: 3]
                    document.getElementById("fest-location").value = fest.ubicacion || ""; //[cite: 3]
                    document.getElementById("fest-artists").value = (fest.artistas_destacados || []).join(", "); //[cite: 3]
                    btnCancelEditFest.hidden = false;
                });

                // Abrir sub-formularios de espacios y tarifas
                card.querySelector(".btn-resources-fest").addEventListener("click", () => {
                    festivalSeleccionadoId = fest.id_festival;
                    document.getElementById("selected-fest-title").textContent = `${fest.nombre} (${fest.id_festival})`;
                    subresourcesPanel.hidden = false;
                });

                // Eliminar festival
                card.querySelector(".btn-delete-fest").addEventListener("click", async () => {
                    if (!confirm(`¿Eliminar el festival "${fest.nombre}"?`)) return;
                    try {
                        await CatalogAPI.eliminarFestival(fest.id_festival); //[cite: 3]
                        cargarFestivalesAdmin();
                    } catch (err) {
                        alert(`Error al eliminar: ${err.detalle}`);
                    }
                });

                adminFestivalsGrid.appendChild(card);
            });
        } catch (err) {
            adminFestivalsGrid.innerHTML = `<p class="error-text">Error: ${err.detalle}</p>`;
        }
    }

    formFestival.addEventListener("submit", async (e) => {
        e.preventDefault();
        const idEdit = festIdInput.value.trim();
        const artistasRaw = document.getElementById("fest-artists").value.trim();

        const payload = {
            nombre: document.getElementById("fest-name").value.trim(), //[cite: 3]
            fecha_inicio: document.getElementById("fest-start").value || undefined, //[cite: 3]
            fecha_fin: document.getElementById("fest-end").value || undefined, //[cite: 3]
            ubicacion: document.getElementById("fest-location").value.trim() || undefined, //[cite: 3]
            artistas_destacados: artistasRaw ? artistasRaw.split(",").map(a => a.trim()) : [] //[cite: 3]
        };

        try {
            if (idEdit) {
                await CatalogAPI.actualizarFestival(idEdit, payload); //[cite: 3]
                alert("Festival actualizado correctamente.");
            } else {
                await CatalogAPI.crearFestival(payload); //[cite: 3]
                alert("Festival creado correctamente.");
            }
            resetearFormFestival();
            cargarFestivalesAdmin();
        } catch (err) {
            alert(`Error guardando festival: ${err.detalle}`);
        }
    });

    btnCancelEditFest.addEventListener("click", resetearFormFestival);

    function resetearFormFestival() {
        formFestival.reset();
        festIdInput.value = "";
        btnCancelEditFest.hidden = true;
    }

    // Añadir espacio a festival seleccionado
    document.getElementById("form-space").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!festivalSeleccionadoId) return;

        const payload = {
            tipo: document.getElementById("space-type").value, //[cite: 3]
            metros_cuadrados: parseInt(document.getElementById("space-sqm").value, 10) || 0, //[cite: 3]
            precio_alquiler: parseFloat(document.getElementById("space-price").value) //[cite: 3]
        };

        try {
            await CatalogAPI.crearEspacioFestival(festivalSeleccionadoId, payload); //[cite: 3]
            alert("Espacio añadido al festival.");
            e.target.reset();
        } catch (err) {
            alert(`Error añadiendo espacio: ${err.detalle}`);
        }
    });

    // Añadir tarifa de entrada a festival seleccionado
    document.getElementById("form-ticket-type").addEventListener("submit", async (e) => {
        e.preventDefault();
        if (!festivalSeleccionadoId) return;

        const payload = {
            tipo: document.getElementById("ticket-type").value, //[cite: 3]
            precio: parseFloat(document.getElementById("ticket-price").value), //[cite: 3]
            disponibles: parseInt(document.getElementById("ticket-stock").value, 10) //[cite: 3]
        };

        try {
            await CatalogAPI.crearEntradaFestival(festivalSeleccionadoId, payload); //[cite: 3]
            alert("Tarifa de entrada añadida.");
            e.target.reset();
        } catch (err) {
            alert(`Error añadiendo entrada: ${err.detalle}`);
        }
    });

    // ==========================================
    // 4. MÓDULO DE ARTISTAS
    // ==========================================
    document.getElementById("form-artist").addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            nombre: document.getElementById("artist-name").value.trim(), //[cite: 3]
            genero: document.getElementById("artist-genre").value.trim() || undefined, //[cite: 3]
            popularidad: parseInt(document.getElementById("artist-popularity").value, 10) || 0 //[cite: 3]
        };

        try {
            await CatalogAPI.crearArtista(payload); //[cite: 3]
            alert("Artista registrado en el catálogo.");
            e.target.reset();
        } catch (err) {
            alert(`Error registrando artista: ${err.detalle}`);
        }
    });

    // ==========================================
    // 5. MÓDULO DE INVENTARIO Y STOCK (MERCH)
    // ==========================================
    const stockTableBody = document.getElementById("stock-table-body");

    async function cargarInventarioAdmin() {
        stockTableBody.innerHTML = `<tr><td colspan="6">Cargando inventario...</td></tr>`;
        try {
            const productos = await InventoryShippingAPI.obtenerStock(); //[cite: 4]
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

                tr.querySelector(".btn-apply-stock").addEventListener("click", async () => {
                    const delta = parseInt(tr.querySelector(".stock-delta-input").value, 10);
                    if (isNaN(delta) || delta === 0) return;

                    try {
                        await InventoryShippingAPI.actualizarStockAdmin(prod.id_producto, delta); //[cite: 4]
                        cargarInventarioAdmin();
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
    // 6. MÓDULO DE LOGÍSTICA Y ENVÍOS
    // ==========================================
    const shippingTableBody = document.getElementById("shipping-table-body");

    async function cargarEnviosAdmin() {
        shippingTableBody.innerHTML = `<tr><td colspan="5">Cargando envíos...</td></tr>`;
        try {
            const envios = await InventoryShippingAPI.obtenerEnvios(); //[cite: 4]
            shippingTableBody.innerHTML = "";

            if (!envios || envios.length === 0) {
                shippingTableBody.innerHTML = `<tr><td colspan="5">No hay envíos pendientes.</td></tr>`;
                return;
            }

            const estadosPosibles = ["Pendiente", "Preparando", "Enviado", "En Reparto", "Entregado", "Incidencia"]; //[cite: 4]

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

                tr.querySelector(".btn-update-shipping").addEventListener("click", async () => {
                    const nuevoEstado = tr.querySelector(".shipping-status-select").value;
                    const tracking = tr.querySelector(".tracking-input").value.trim() || null;

                    try {
                        await InventoryShippingAPI.actualizarTracking(env.id_envio, nuevoEstado, tracking); //[cite: 4]
                        alert("Estado logístico actualizado.");
                        cargarEnviosAdmin();
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

    // Arrancar la primera pestaña por defecto
    cargarFestivalesAdmin();
});