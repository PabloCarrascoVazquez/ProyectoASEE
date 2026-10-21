package com.subsonic.purchaseservice.models;

import com.fasterxml.jackson.annotation.JsonValue;

public enum PaymentMethod {
    TARJETA("tarjeta"),
    PAYPAL("paypal"),
    BIZUM("bizum");

    private final String value;

    PaymentMethod(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static PaymentMethod fromString(String text) {
        if (text == null) return null;
        for (PaymentMethod m : PaymentMethod.values()) {
            if (m.value.equalsIgnoreCase(text) || m.name().equalsIgnoreCase(text)) {
                return m;
            }
        }
        return TARJETA;
    }
}

