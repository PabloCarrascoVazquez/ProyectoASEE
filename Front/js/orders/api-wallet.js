/**
 * Módulo de Billetera (Wallet), Entradas y Accesos para Subsonic.
 * Conecta con los endpoints del microservicio de pedidos a través del Gateway.
 */
const WalletAPI = {
    /**
     * Obtiene la lista de entradas digitales adquiridas por el usuario autenticado[cite: 5].
     * Ruta: GET /pedidos/mis-entradas[cite: 5]
     * 
     * @returns {Promise<Array>} Lista de objetos de tipo Entrada[cite: 5]
     */
    async obtenerMisEntradas() {
        return await apiRequest("/pedidos/mis-entradas", {
            method: "GET"
        });
    },

    /**
     * Obtiene el token criptográfico necesario para renderizar el código QR de una entrada[cite: 5].
     * Nota: Recuerda que en el Gateway esta ruta debe enrutarse correctamente al OrderService.
     * Ruta: GET /pedidos/mis-entradas/{id_entrada}/qr[cite: 5]
     * 
     * @param {string} idEntrada UUID de la entrada[cite: 5]
     * @returns {Promise<Object>} Objeto con el token_qr y su fecha_expiracion[cite: 5]
     */
    async obtenerTokenQR(idEntrada) {
        return await apiRequest(`/pedidos/mis-entradas/${idEntrada}/qr`, {
            method: "GET"
        });
    },

    /**
     * Solicita la cancelación o devolución de una entrada[cite: 5].
     * Ruta: POST /pedidos/{id_entrada}/cancelaciones[cite: 5]
     * 
     * @param {string} idEntrada UUID de la entrada a cancelar[cite: 5]
     * @returns {Promise<Object>} Detalles de la solicitud de cancelación[cite: 5]
     */
    async solicitarCancelacion(idEntrada) {
        return await apiRequest(`/pedidos/${idEntrada}/cancelaciones`, {
            method: "POST"
        });
    },

    /**
     * Valida un código QR escaneado en la puerta (Uso exclusivo para staff)[cite: 5].
     * Ruta: POST /acceso/validar-qr[cite: 5]
     * 
     * @param {string} tokenQr El string del token QR escaneado[cite: 5]
     * @returns {Promise<Object>} Resultado de la validación y estado de acceso[cite: 5]
     */
    async validarQRStaff(tokenQr) {
        return await apiRequest("/acceso/validar-qr", {
            method: "POST",
            body: JSON.stringify({ token_qr: tokenQr })
        });
    }
};