package com.subsonic.purchaseservice.services;

public class PaymentResult {
    private final boolean success;
    private final String gatewayTransactionId;
    private final String receiptUrl;
    private final String errorCode;
    private final String errorMessage;

    private PaymentResult(boolean success, String gatewayTransactionId, String receiptUrl,
                          String errorCode, String errorMessage) {
        this.success = success;
        this.gatewayTransactionId = gatewayTransactionId;
        this.receiptUrl = receiptUrl;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    public static PaymentResult success(String gatewayTransactionId, String receiptUrl) {
        return new PaymentResult(true, gatewayTransactionId, receiptUrl, null, null);
    }

    public static PaymentResult failure(String errorCode, String errorMessage) {
        return new PaymentResult(false, null, null, errorCode, errorMessage);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getGatewayTransactionId() {
        return gatewayTransactionId;
    }

    public String getReceiptUrl() {
        return receiptUrl;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }
}

