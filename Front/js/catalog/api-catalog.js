/**
 * Módulo de Catálogo (Festivales, Espacios, Entradas y Artistas) para Subsonic.
 * Conecta con los endpoints del microservicio de catálogo a través del Gateway.
 */
const CatalogAPI = {
    /**
     * Lista todos los festivales y su escaleta.
     * Ruta: GET /festivales[cite: 6]
     * @returns {Promise<Array>} Lista de festivales[cite: 6]
     */
    async obtenerFestivales() {
        return await apiRequest("/festivales", {
            method: "GET"
        });
    },

    /**
     * Crea un nuevo festival (Solo Administradores).
     * Ruta: POST /festivales[cite: 6]
     * @param {Object} festivalData Datos del festival (FestivalCreateRequest)[cite: 6]
     */
    async crearFestival(festivalData) {
        return await apiRequest("/festivales", {
            method: "POST",
            body: JSON.stringify(festivalData)
        });
    },

    /**
     * Modifica un festival existente (Solo Administradores).
     * Ruta: PUT /festivales/{id_festival}[cite: 6]
     * @param {string} idFestival ID del festival[cite: 6]
     * @param {Object} festivalData Datos modificados[cite: 6]
     */
    async actualizarFestival(idFestival, festivalData) {
        return await apiRequest(`/festivales/${idFestival}`, {
            method: "PUT",
            body: JSON.stringify(festivalData)
        });
    },

    /**
     * Elimina un festival (Solo Administradores).
     * Ruta: DELETE /festivales/{id_festival}[cite: 6]
     * @param {string} idFestival ID del festival[cite: 6]
     */
    async eliminarFestival(idFestival) {
        return await apiRequest(`/festivales/${idFestival}`, {
            method: "DELETE"
        });
    },

    /**
     * Lista las parcelas y el mapa del recinto de un festival.
     * Ruta: GET /festivales/{id_festival}/espacios[cite: 6]
     * @param {string} idFestival ID del festival[cite: 6]
     */
    async obtenerEspaciosFestival(idFestival) {
        return await apiRequest(`/festivales/${idFestival}/espacios`, {
            method: "GET"
        });
    },

    /**
     * Añade una parcela o espacio a un festival (Solo Administradores).
     * Ruta: POST /festivales/{id_festival}/espacios[cite: 6]
     * @param {string} idFestival ID del festival[cite: 6]
     * @param {Object} espacioData Datos del espacio (EspacioCreateRequest)[cite: 6]
     */
    async crearEspacioFestival(idFestival, espacioData) {
        return await apiRequest(`/festivales/${idFestival}/espacios`, {
            method: "POST",
            body: JSON.stringify(espacioData)
        });
    },

    /**
     * Consulta las tarifas y la disponibilidad de entradas de un festival.
     * Ruta: GET /festivales/{id_festival}/entradas[cite: 6]
     * @param {string} idFestival ID del festival[cite: 6]
     */
    async obtenerEntradasFestival(idFestival) {
        return await apiRequest(`/festivales/${idFestival}/entradas`, {
            method: "GET"
        });
    },

    /**
     * Añade tipos de entradas a un festival (Solo Administradores).
     * Ruta: POST /festivales/{id_festival}/entradas[cite: 6]
     * @param {string} idFestival ID del festival[cite: 6]
     * @param {Object} entradaData Datos de la entrada (TipoEntradaCreateRequest)[cite: 6]
     */
    async crearEntradaFestival(idFestival, entradaData) {
        return await apiRequest(`/festivales/${idFestival}/entradas`, {
            method: "POST",
            body: JSON.stringify(entradaData)
        });
    },

    /**
     * Solicita el alquiler de una parcela o espacio por un proveedor.
     * Ruta: POST /espacios/{id}/alquileres[cite: 6]
     * @param {string} idEspacio UUID del espacio/parcela[cite: 6]
     * @param {Object} alquilerData Datos del negocio (AlquilerRequest)[cite: 6]
     */
    async solicitarAlquilerEspacio(idEspacio, alquilerData) {
        return await apiRequest(`/espacios/${idEspacio}/alquileres`, {
            method: "POST",
            body: JSON.stringify(alquilerData)
        });
    },

    /**
     * Guarda un artista en la lista de favoritos del usuario autenticado.
     * Ruta: POST /artistas-favoritos[cite: 6]
     * @param {Object} favoritoData Datos del artista favorito (ArtistaFavoritoRequest)[cite: 6]
     */
    async guardarArtistaFavorito(favoritoData) {
        return await apiRequest("/artistas-favoritos", {
            method: "POST",
            body: JSON.stringify(favoritoData)
        });
    },

    /**
     * Añade un nuevo artista al catálogo general (Solo Administradores).
     * Ruta: POST /artistas[cite: 6]
     * @param {Object} artistaData Datos del artista (ArtistaCreateRequest)[cite: 6]
     */
    async crearArtista(artistaData) {
        return await apiRequest("/artistas", {
            method: "POST",
            body: JSON.stringify(artistaData)
        });
    }
};