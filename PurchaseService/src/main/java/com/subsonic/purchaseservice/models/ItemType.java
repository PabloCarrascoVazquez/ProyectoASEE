package com.subsonic.purchaseservice.models;

import com.fasterxml.jackson.annotation.JsonValue;

public enum ItemType {
    TICKET("ticket"),
    MERCHANDISE("merchandise");

    private final String value;

    ItemType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static ItemType fromString(String text) {
        if (text == null) return null;
        for (ItemType t : ItemType.values()) {
            if (t.value.equalsIgnoreCase(text) || t.name().equalsIgnoreCase(text)) {
                return t;
            }
        }
        return TICKET;
    }
}

