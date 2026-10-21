package com.subsonic.purchaseservice.services;

public interface PaymentGatewayAdapter {
    /**
     * Procesa un cobro ante la pasarela bancaria externa (Stripe / Redsys).
     *
     * @param request Datos de la orden y del token bancario.
     * @return PaymentResult con el resultado de la transacción.
     */
    PaymentResult processPayment(PaymentRequest request);
}

