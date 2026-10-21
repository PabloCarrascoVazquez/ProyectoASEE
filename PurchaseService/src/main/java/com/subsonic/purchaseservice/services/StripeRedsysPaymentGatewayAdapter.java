package com.subsonic.purchaseservice.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class StripeRedsysPaymentGatewayAdapter implements PaymentGatewayAdapter {
    private static final Logger log = LoggerFactory.getLogger(StripeRedsysPaymentGatewayAdapter.class);

    @Override
    public PaymentResult processPayment(PaymentRequest request) {
        log.info("Procesando pago de {} {} con método {} para transacción {}",
                request.getAmount(), request.getCurrency(), request.getPaymentMethod(), request.getTransactionId());

        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Rechazo de pago: el monto debe ser mayor a cero");
            return PaymentResult.failure("INVALID_AMOUNT", "El importe a cobrar no es válido.");
        }

        String token = request.getGatewayToken();
        if (token == null || token.isBlank()) {
            log.warn("Rechazo de pago: token de pasarela vacío");
            return PaymentResult.failure("MISSING_TOKEN", "El token de la pasarela bancaria es requerido.");
        }

        // Simulación de rechazo bancario controlado mediante tokens específicos
        if (token.toLowerCase().contains("fail") ||
            token.toLowerCase().contains("decline") ||
            token.toLowerCase().contains("error") ||
            "tok_fail".equalsIgnoreCase(token)) {

            log.warn("Simulación de pasarela: Pago rechazado por la entidad bancaria para token {}", token);
            return PaymentResult.failure("CARD_DECLINED", "Operación denegada por la entidad bancaria emisora (Fondos insuficientes o tarjeta inválida).");
        }

        // Simulación de éxito bancario (Stripe charge ID / Redsys auth code)
        String gatewayTxId = "ch_" + UUID.randomUUID().toString().replace("-", "").substring(0, 20);
        String receiptUrl = "https://pagos.subsonic.com/recibos/tx-" + request.getTransactionId();

        log.info("Simulación de pasarela: Pago aprobado exitosamente. TxId: {}", gatewayTxId);
        return PaymentResult.success(gatewayTxId, receiptUrl);
    }
}

