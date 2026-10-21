package com.subsonic.purchaseservice.models;

import com.fasterxml.jackson.annotation.JsonValue;

public enum TicketType {
    DAY("day"),
    WEEKEND("weekend"),
    VIP("vip");

    private final String value;

    TicketType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static TicketType fromString(String text) {
        if (text == null) return null;
        for (TicketType t : TicketType.values()) {
            if (t.value.equalsIgnoreCase(text) || t.name().equalsIgnoreCase(text)) {
                return t;
            }
        }
        return DAY;
    }
}

