package com.subsonic.purchaseservice.models;

import com.fasterxml.jackson.annotation.JsonValue;

public enum TransactionType {
    TICKET("ticket"),
    MERCHANDISE("merchandise"),
    MIXED("mixed");

    private final String value;

    TransactionType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static TransactionType fromString(String text) {
        if (text == null) return null;
        for (TransactionType b : TransactionType.values()) {
            if (b.value.equalsIgnoreCase(text) || b.name().equalsIgnoreCase(text)) {
                return b;
            }
        }
        return TICKET;
    }
}

