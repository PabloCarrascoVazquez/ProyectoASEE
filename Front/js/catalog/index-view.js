document.addEventListener("DOMContentLoaded", () => {
    // Referencias a elementos de navegación y estado
    const navAdmin = document.getElementById("nav-admin");
    const navAuth = document.getElementById("nav-auth");
    const cartCountBadge = document.getElementById("cart-count");

    // Referencias a pestañas principales
    const btnShowCatalog = document.getElementById("btn-show-catalog");
    const btnShowMerch = document.getElementById("btn-show-merch");
    const sectionCatalog = document.getElementById("section-catalog");
    const sectionMerch = document.getElementById("section-merch");

    // Referencias a listas y vistas de detalle (Festivales)
    const festivalsGrid = document.getElementById("festivals-grid");
    const festivalDetailView = document.getElementById("festival-detail-view");
    const btnCloseFestival = document.getElementById("btn-close-festival");

    // Referencias a listas y vistas de detalle (Merchandising)
    const merchGrid = document.getElementById("merch-grid");
    const merchDetailView = document.getElementById("merch-detail-view");
    const btnCloseMerch = document.getElementById("btn-close-merch");
    const btnAddMerchCart = document.getElementById("btn-add-merch-cart");

    let productoSeleccionado = null;

    // ==========================================
    // 1. INICIALIZAR BARRA DE NAVEGACIÓN Y CARRITO
    // ==========================================
    function actualizarHeader() {
        if (SessionManager.isAuthenticated()) {
            const user = SessionManager.getUser();
            navAuth.innerHTML = `<span class="user-greeting">Hola, ${user.name}</span> <button type="button" id="btn-logout-nav" class="btn-logout">Salir</button>`;
            document.getElementById("btn-logout-nav").addEventListener("click", () => SessionManager.clearSession());

            if (SessionManager.isAdmin()) {
                navAdmin.hidden = false;
            }
            if (SessionManager.isSupplier()) {
                const walletLink = document.querySelector('a[href="./wallet.html"]');
                if (walletLink) walletLink.textContent = "Mis Espacios";
            }
        }
        actualizarContadorCarrito();
    }

    function obtenerCarrito() {
        const raw = JSON.parse(localStorage.getItem("subsonic_cart")) || {};
        return {
            id_festival: raw.id_festival || null,
            entradas: raw.entradas || [],
            merchandising: raw.merchandising || [],
            espacios: raw.espacios || []
        };
    }

    function guardarCarrito(carrito) {
        localStorage.setItem("subsonic_cart", JSON.stringify(carrito));
        actualizarContadorCarrito();
    }

    function actualizarContadorCarrito() {
        const carrito = obtenerCarrito();
        const totalEntradas = carrito.entradas.reduce((acc, item) => acc + item.cantidad, 0);
        const totalMerch = carrito.merchandising.reduce((acc, item) => acc + item.cantidad, 0);
        const totalEspacios = (carrito.espacios || []).length;
        cartCountBadge.textContent = totalEntradas + totalMerch + totalEspacios;
    }

    // ==========================================
    // 2. ALTERNAR ENTRE CATÁLOGO Y MERCHANDISING
    // ==========================================
    btnShowCatalog.addEventListener("click", () => {
        btnShowCatalog.classList.add("active");
        btnShowMerch.classList.remove("active");
        sectionCatalog.hidden = false;
        sectionMerch.hidden = true;
        cerrarDetalleFestival();
    });

    btnShowMerch.addEventListener("click", () => {
        btnShowMerch.classList.add("active");
        btnShowCatalog.classList.remove("active");
        sectionMerch.hidden = false;
        sectionCatalog.hidden = true;
        cerrarDetalleMerch();
        cargarMerchandising();
    });

    // ==========================================
    // 3. LÓGICA DE FESTIVALES (LISTADO Y ENFOQUE)
    // ==========================================
    async function cargarFestivales() {
        festivalsGrid.innerHTML = `<p class="loading-text">Cargando festivales...</p>`;
        try {
            const festivales = await CatalogAPI.obtenerFestivales(); //[cite: 4]
            if (!festivales || festivales.length === 0) {
                festivalsGrid.innerHTML = `<p class="empty-msg">No hay festivales disponibles en este momento.</p>`;
                return;
            }

            festivalsGrid.innerHTML = "";
            festivales.forEach(fest => {
                const card = document.createElement("div");
                card.className = "item-card festival-card";
                card.innerHTML = `
                    <h3 class="card-title">${fest.nombre}</h3>
                    <p class="card-meta">${fest.fecha_inicio || ""} - ${fest.fecha_fin || ""}</p>
                    <p class="card-meta">${fest.ubicacion || "Ubicación por confirmar"}</p>
                    <button type="button" class="btn-primary btn-view-festival">Ver Detalles y Entradas</button>
                `;
                card.querySelector(".btn-view-festival").addEventListener("click", () => enfocarFestival(fest));
                festivalsGrid.appendChild(card);
            });
        } catch (err) {
            festivalsGrid.innerHTML = `<p class="error-text">Error al cargar festivales: ${err.detalle}</p>`;
        }
    }

    async function enfocarFestival(festival) {
        festivalsGrid.hidden = true;
        festivalDetailView.hidden = false;

        document.getElementById("detail-fest-name").textContent = festival.nombre;
        document.getElementById("detail-fest-dates").textContent = `${festival.fecha_inicio || ""} al ${festival.fecha_fin || ""}`;
        document.getElementById("detail-fest-location").textContent = festival.ubicacion || "";

        const esProveedor = SessionManager.isSupplier();
        const artistsSubsection = festivalDetailView.querySelector(".artists-subsection");
        const ticketsSubsection = festivalDetailView.querySelector(".tickets-subsection");

        if (artistsSubsection) artistsSubsection.hidden = esProveedor;
        if (ticketsSubsection) ticketsSubsection.hidden = esProveedor;

        if (!esProveedor) {
            // Pintar artistas destacados
            const artistsList = document.getElementById("detail-fest-artists");
            artistsList.innerHTML = "";
            (festival.artistas_destacados || []).forEach(artista => {
                const li = document.createElement("li");
                li.className = "artist-item";
                li.innerHTML = `<span>${artista}</span> `;
                
                if (SessionManager.isAuthenticated()) {
                    const btnFav = document.createElement("button");
                    btnFav.type = "button";
                    btnFav.className = "btn-fav";
                    btnFav.textContent = "★ Favorito";
                    btnFav.addEventListener("click", async () => {
                        try {
                            await CatalogAPI.guardarArtistaFavorito({
                                id_festival: festival.id_festival,
                                nombre_artista: artista
                            });
                            alert(`¡${artista} añadido a tus favoritos!`);
                        } catch (err) {
                            alert(`Error: ${err.detalle}`);
                        }
                    });
                    li.appendChild(btnFav);
                }
                artistsList.appendChild(li);
            });

            // Cargar entradas del festival
            const ticketsContainer = document.getElementById("detail-fest-tickets");
            ticketsContainer.innerHTML = `<p class="loading-text">Cargando tarifas...</p>`;
            try {
                const entradas = await CatalogAPI.obtenerEntradasFestival(festival.id_festival);
                ticketsContainer.innerHTML = "";
                if (!entradas || entradas.length === 0) {
                    ticketsContainer.innerHTML = `<p class="empty-msg">No hay entradas configuradas para este evento.</p>`;
                } else {
                    entradas.forEach(ent => {
                        const row = document.createElement("div");
                        row.className = "ticket-row";
                        row.innerHTML = `
                            <span class="ticket-type">${ent.tipo.toUpperCase()}</span> - 
                            <strong class="ticket-price">${ent.precio} €</strong> 
                            <span class="ticket-stock">(${ent.disponibles} disponibles)</span>
                            <button type="button" class="btn-primary btn-add-ticket" ${ent.disponibles <= 0 ? "disabled" : ""}>
                                Añadir Entrada
                            </button>
                        `;
                        row.querySelector(".btn-add-ticket").addEventListener("click", () => {
                            agregarEntradaAlCarrito(festival.id_festival, ent.tipo, ent.precio);
                        });
                        ticketsContainer.appendChild(row);
                    });
                }
            } catch (err) {
                ticketsContainer.innerHTML = `<p class="error-text">No se pudieron cargar las entradas.</p>`;
            }
        }

        // Cargar espacios/parcelas del recinto
        const spacesContainer = document.getElementById("detail-fest-spaces");
        spacesContainer.innerHTML = `<p class="loading-text">Cargando mapa de espacios...</p>`;
        try {
            const espacios = await CatalogAPI.obtenerEspaciosFestival(festival.id_festival);
            spacesContainer.innerHTML = "";
            if (!espacios || espacios.length === 0) {
                spacesContainer.innerHTML = `<p class="empty-msg">No hay parcelas registradas.</p>`;
            } else {
                if (!esProveedor) {
                    spacesContainer.className = "spaces-list client-spaces-grid";
                    espacios.forEach(esp => {
                        const div = document.createElement("div");
                        div.className = "space-row client-space-item";
                        div.innerHTML = `
                            <span>Zona: <strong>${esp.tipo}</strong> (${esp.metros_cuadrados} m²)</span>
                        `;
                        spacesContainer.appendChild(div);
                    });
                } else {
                    spacesContainer.className = "spaces-list";
                    espacios.forEach(esp => {
                        const disponible = (esp.estado || "").toLowerCase() === "disponible";
                        const div = document.createElement("div");
                        div.className = "space-row supplier-space-row";
                        div.innerHTML = `
                            <span>Zona: <strong>${esp.tipo}</strong> (${esp.metros_cuadrados} m²)</span>
                            <strong class="ticket-price">${esp.precio_alquiler} €</strong>
                            <span class="status-badge ${disponible ? "success" : "error"}">${(esp.estado || "").toUpperCase()}</span>
                            <button type="button" class="btn-primary btn-rent-space" ${!disponible ? "disabled" : ""}>
                                ${disponible ? "Alquilar Espacio" : "No Disponible"}
                            </button>
                        `;
                        if (disponible) {
                            div.querySelector(".btn-rent-space").addEventListener("click", () => {
                                agregarEspacioAlCarrito(festival, esp);
                            });
                        }
                        spacesContainer.appendChild(div);
                    });
                }
            }
        } catch (err) {
            spacesContainer.innerHTML = `<p class="error-text">No se pudieron cargar los espacios.</p>`;
        }
    }

    function cerrarDetalleFestival() {
        festivalDetailView.hidden = true;
        festivalsGrid.hidden = false;
    }

    btnCloseFestival.addEventListener("click", cerrarDetalleFestival);

    function agregarEntradaAlCarrito(idFestival, tipoEntrada, precio) {
        const carrito = obtenerCarrito();
        // Si había entradas de otro festival, avisamos y reiniciamos entradas
        if (carrito.id_festival && carrito.id_festival !== idFestival && carrito.entradas.length > 0) {
            if (!confirm("Ya tienes entradas de otro festival en el carrito. ¿Quieres reemplazarlas?")) return;
            carrito.entradas = [];
        }

        carrito.id_festival = idFestival;
        const existente = carrito.entradas.find(e => e.tipo_entrada === tipoEntrada);
        if (existente) {
            existente.cantidad += 1;
        } else {
            carrito.entradas.push({ tipo_entrada: tipoEntrada, cantidad: 1, precio_unitario: precio });
        }

        guardarCarrito(carrito);
        alert(`Entrada ${tipoEntrada.toUpperCase()} añadida al carrito.`);
    }

    function agregarEspacioAlCarrito(festival, espacio) {
        const carrito = obtenerCarrito();
        if (!carrito.espacios) carrito.espacios = [];

        const yaExiste = carrito.espacios.find(s => s.id_espacio === espacio.id_espacio);
        if (yaExiste) {
            alert("Este espacio ya está añadido en tu carrito.");
            return;
        }

        carrito.espacios.push({
            id_espacio: espacio.id_espacio,
            id_festival: festival.id_festival,
            nombre_festival: festival.nombre,
            tipo: espacio.tipo,
            metros_cuadrados: espacio.metros_cuadrados,
            precio_alquiler: espacio.precio_alquiler
        });

        guardarCarrito(carrito);
        alert(`Espacio ${espacio.tipo.toUpperCase()} (${espacio.metros_cuadrados} m²) añadido al carrito.`);
    }

    // ==========================================
    // 4. LÓGICA DE MERCHANDISING (LISTADO Y ENFOQUE)
    // ==========================================
    async function cargarMerchandising() {
        merchGrid.innerHTML = `<p class="loading-text">Cargando productos...</p>`;
        try {
            const productos = await InventoryShippingAPI.obtenerStock(); //[cite: 5]
            if (!productos || productos.length === 0) {
                merchGrid.innerHTML = `<p class="empty-msg">No hay productos de merchandising disponibles.</p>`;
                return;
            }

            merchGrid.innerHTML = "";
            productos.forEach(prod => {
                const card = document.createElement("div");
                card.className = "item-card merch-card";
                card.innerHTML = `
                    <h3 class="card-title">${prod.nombre_producto}</h3>
                    <p class="card-meta">${prod.variante || ""}</p>
                    <p class="card-price">${prod.precio} €</p>
                    <p class="card-stock">Stock: ${prod.unidades_disponibles}</p>
                    <button type="button" class="btn-primary btn-view-merch">Ver Producto</button>
                `;
                card.querySelector(".btn-view-merch").addEventListener("click", () => enfocarProducto(prod));
                merchGrid.appendChild(card);
            });
        } catch (err) {
            merchGrid.innerHTML = `<p class="error-text">Error al cargar productos: ${err.detalle}</p>`;
        }
    }

    function enfocarProducto(producto) {
        productoSeleccionado = producto;
        merchGrid.hidden = true;
        merchDetailView.hidden = false;

        document.getElementById("detail-merch-name").textContent = producto.nombre_producto;
        document.getElementById("detail-merch-variant").textContent = producto.variante || "Estándar";
        document.getElementById("detail-merch-price").textContent = `${producto.precio} €`;
        document.getElementById("detail-merch-stock").textContent = `Unidades disponibles: ${producto.unidades_disponibles}`;

        const qtyInput = document.getElementById("merch-qty");
        qtyInput.value = 1;
        qtyInput.max = producto.unidades_disponibles;
        btnAddMerchCart.disabled = producto.unidades_disponibles <= 0;
    }

    function cerrarDetalleMerch() {
        productoSeleccionado = null;
        merchDetailView.hidden = true;
        merchGrid.hidden = false;
    }

    btnCloseMerch.addEventListener("click", cerrarDetalleMerch);

    btnAddMerchCart.addEventListener("click", () => {
        if (!productoSeleccionado) return;
        const cantidad = parseInt(document.getElementById("merch-qty").value, 10) || 1;
        if (cantidad <= 0) return;

        const carrito = obtenerCarrito();
        const existente = carrito.merchandising.find(m => m.id_producto === productoSeleccionado.id_producto);
        if (existente) {
            existente.cantidad += cantidad;
        } else {
            carrito.merchandising.push({
                id_producto: productoSeleccionado.id_producto,
                nombre_producto: productoSeleccionado.nombre_producto,
                precio_unitario: productoSeleccionado.precio,
                cantidad
            });
        }

        guardarCarrito(carrito);
        alert(`Añadido: ${cantidad}x ${productoSeleccionado.nombre_producto} al carrito.`);
    });

    // Arrancar vista
    actualizarHeader();
    cargarFestivales();
});