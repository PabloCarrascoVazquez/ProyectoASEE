/**
 * Módulo de Checkout y Pagos para Subsonic.
 * Conecta con los endpoints del microservicio de compras a través del Gateway.
 */
const CheckoutAPI = {
    /**
     * Inicia una compra mixta (entradas y/o merchandising).
     * Bloquea temporalmente el stock/aforo durante 10 minutos[cite: 4].
     * 
     * @param {Object} payload Estructura de tipo ReservaCarritoCompletoRequest[cite: 4]
     * @returns {Promise<Object>} Retorna la respuesta con el id_transaccion, estado y total a pagar[cite: 4]
     */
    async iniciarReserva(payload) {
        return await apiRequest("/compras/carrito/iniciar", {
            method: "POST",
            body: JSON.stringify(payload)
        });
    },

    /**
     * Confirma el pago de una transacción pendiente, validando con la pasarela bancaria[cite: 4].
     * 
     * @param {string} idTransaccion UUID de la transacción obtenida al iniciar la reserva[cite: 4]
     * @param {string} metodoPago Método de pago ('tarjeta', 'paypal', 'bizum')[cite: 4]
     * @param {string} tokenPasarela Token simulado de la pasarela de pago[cite: 4]
     * @returns {Promise<Object>} Retorna el recibo, estado 'PAID' y detalles del cobro[cite: 4]
     */
    async confirmarPago(idTransaccion, metodoPago, tokenPasarela) {
        const payload = {
            metodo_pago: metodoPago,
            token_pasarela: tokenPasarela
        };

        return await apiRequest(`/compras/${idTransaccion}/pagar`, {
            method: "POST",
            body: JSON.stringify(payload)
        });
    }
};