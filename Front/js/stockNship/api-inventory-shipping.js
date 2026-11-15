/**
 * Módulo de Inventarios y Envíos (Merchandising y Logística) para Subsonic.
 * Conecta con los endpoints del microservicio de inventarios y envíos a través del Gateway.
 */
const InventoryShippingAPI = {
    /**
     * Consulta el stock disponible de todos los productos de merchandising.
     * Ruta: GET /inventario/stock[cite: 7]
     * @returns {Promise<Array>} Listado de stock disponible (StockProducto)[cite: 7]
     */
    async obtenerStock() {
        return await apiRequest("/inventario/stock", {
            method: "GET"
        });
    },

    /**
     * Actualiza el stock físico de un producto (Solo Administradores).
     * Ruta: PUT /inventario/{id_producto}[cite: 7]
     * @param {string} idProducto UUID del producto[cite: 7]
     * @param {number} variacionUnidades Cantidad a sumar (positivo) o restar (negativo)[cite: 7]
     * @returns {Promise<Object>} Datos actualizados del producto[cite: 7]
     */
    async actualizarStockAdmin(idProducto, variacionUnidades) {
        return await apiRequest(`/inventario/${idProducto}`, {
            method: "PUT",
            body: JSON.stringify({ variacion_unidades: variacionUnidades })
        });
    },

    /**
     * Bloqueo temporal de stock (Llamada interna o desde el flujo de compras).
     * Ruta: POST /inventario/{id_producto}/bloquear[cite: 7]
     * @param {string} idProducto UUID del producto[cite: 7]
     * @param {number} cantidad Unidades a bloquear temporalmente[cite: 7]
     * @returns {Promise<Object>} Resultado del bloqueo y precio unitario[cite: 7]
     */
    async bloquearStock(idProducto, cantidad = 1) {
        return await apiRequest(`/inventario/${idProducto}/bloquear`, {
            method: "POST",
            body: JSON.stringify({ cantidad })
        });
    },

    /**
     * Libera stock bloqueado tras la expiración de un carrito o fallo de pago.
     * Ruta: POST /inventario/{id_producto}/liberar[cite: 7]
     * @param {string} idProducto UUID del producto[cite: 7]
     * @param {number} cantidad Unidades a liberar[cite: 7]
     */
    async liberarStock(idProducto, cantidad = 1) {
        return await apiRequest(`/inventario/${idProducto}/liberar`, {
            method: "POST",
            body: JSON.stringify({ cantidad })
        });
    },

    /**
     * Lista todos los envíos pendientes de despachar (Requiere rol autorizado).
     * Ruta: GET /envios[cite: 7]
     * @returns {Promise<Array>} Lista de paquetes y envíos logísticos[cite: 7]
     */
    async obtenerEnvios() {
        return await apiRequest("/envios", {
            method: "GET"
        });
    },

    /**
     * Actualiza el estado logístico de un envío o añade número de tracking (Ej. "En Reparto").
     * Ruta: PUT /envios/{id_envio}/tracking[cite: 7]
     * @param {string} idEnvio UUID del envío[cite: 7]
     * @param {string} estadoEnvio Nuevo estado[cite: 7]
     * @param {string} trackingNumber Número de seguimiento opcional[cite: 7]
     * @param {string} notasIncidencia Notas adicionales en caso de incidencia[cite: 7]
     * @returns {Promise<Object>} Objeto con el envío logístico actualizado[cite: 7]
     */
    async actualizarTracking(idEnvio, estadoEnvio, trackingNumber = null, notasIncidencia = null) {
        const payload = {
            estado_envio: estadoEnvio,
            ...(trackingNumber ? { tracking_number: trackingNumber } : {}),
            ...(notasIncidencia ? { notas_incidencia: notasIncidencia } : {})
        };

        return await apiRequest(`/envios/${idEnvio}/tracking`, {
            method: "PUT",
            body: JSON.stringify(payload)
        });
    }
};