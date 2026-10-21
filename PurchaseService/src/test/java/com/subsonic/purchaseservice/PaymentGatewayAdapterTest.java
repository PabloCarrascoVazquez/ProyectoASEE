package com.subsonic.purchaseservice;

import com.subsonic.purchaseservice.services.PaymentGatewayAdapter;
import com.subsonic.purchaseservice.services.PaymentRequest;
import com.subsonic.purchaseservice.services.PaymentResult;
import com.subsonic.purchaseservice.services.StripeRedsysPaymentGatewayAdapter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class PaymentGatewayAdapterTest {

    private PaymentGatewayAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new StripeRedsysPaymentGatewayAdapter();
    }

    @Test
    void testProcessPayment_Success() {
        PaymentRequest request = new PaymentRequest(
                BigDecimal.valueOf(150.00),
                "EUR",
                "tarjeta",
                "tok_1N4L8s2eZvKYlo2C0V",
                "tx-12345",
                "usr-001"
        );

        PaymentResult result = adapter.processPayment(request);

        assertTrue(result.isSuccess());
        assertNotNull(result.getGatewayTransactionId());
        assertTrue(result.getGatewayTransactionId().startsWith("ch_"));
        assertNotNull(result.getReceiptUrl());
        assertTrue(result.getReceiptUrl().contains("tx-12345"));
        assertNull(result.getErrorMessage());
    }

    @Test
    void testProcessPayment_Failure_CardDeclined() {
        PaymentRequest request = new PaymentRequest(
                BigDecimal.valueOf(150.00),
                "EUR",
                "tarjeta",
                "tok_fail_declined",
                "tx-12345",
                "usr-001"
        );

        PaymentResult result = adapter.processPayment(request);

        assertFalse(result.isSuccess());
        assertEquals("CARD_DECLINED", result.getErrorCode());
        assertNotNull(result.getErrorMessage());
    }

    @Test
    void testProcessPayment_Failure_InvalidAmount() {
        PaymentRequest request = new PaymentRequest(
                BigDecimal.ZERO,
                "EUR",
                "tarjeta",
                "tok_valid",
                "tx-12345",
                "usr-001"
        );

        PaymentResult result = adapter.processPayment(request);

        assertFalse(result.isSuccess());
        assertEquals("INVALID_AMOUNT", result.getErrorCode());
    }
}

