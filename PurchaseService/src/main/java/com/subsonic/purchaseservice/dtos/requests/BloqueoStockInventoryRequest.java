package com.subsonic.purchaseservice.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BloqueoStockInventoryRequest {
    @JsonProperty("cantidad")
    private int cantidad;

    public BloqueoStockInventoryRequest() {
    }

    public BloqueoStockInventoryRequest(int cantidad) {
        this.cantidad = cantidad;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }
}

