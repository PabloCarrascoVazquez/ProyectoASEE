package com.subsonic.purchaseservice.services;

import java.math.BigDecimal;

public class PaymentRequest {
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String gatewayToken;
    private String transactionId;
    private String userId;

    public PaymentRequest() {
    }

    public PaymentRequest(BigDecimal amount, String currency, String paymentMethod,
                          String gatewayToken, String transactionId, String userId) {
        this.amount = amount;
        this.currency = currency;
        this.paymentMethod = paymentMethod;
        this.gatewayToken = gatewayToken;
        this.transactionId = transactionId;
        this.userId = userId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getGatewayToken() {
        return gatewayToken;
    }

    public void setGatewayToken(String gatewayToken) {
        this.gatewayToken = gatewayToken;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}

