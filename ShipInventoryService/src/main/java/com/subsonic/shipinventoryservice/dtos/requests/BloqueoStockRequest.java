package com.subsonic.shipinventoryservice.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * Request para bloquear o liberar stock temporal de un producto (llamada interna desde PurchaseService).
 */
public class BloqueoStockRequest {

    @NotNull(message = "El campo 'cantidad' es obligatorio.")
    @Min(value = 1, message = "La cantidad debe ser al menos 1.")
    @JsonProperty("cantidad")
    private Integer cantidad;

    public BloqueoStockRequest() {}

    public BloqueoStockRequest(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
}
