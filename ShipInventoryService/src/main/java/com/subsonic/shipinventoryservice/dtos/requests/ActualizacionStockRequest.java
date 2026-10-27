package com.subsonic.shipinventoryservice.dtos.requests;

import jakarta.validation.constraints.NotNull;

/**
 * Request para actualizar el stock de un producto (variación positiva o negativa).
 */
public class ActualizacionStockRequest {

    @NotNull(message = "El campo 'variacion_unidades' es obligatorio.")
    private Integer variacionUnidades;

    public ActualizacionStockRequest() {}

    public ActualizacionStockRequest(Integer variacionUnidades) {
        this.variacionUnidades = variacionUnidades;
    }

    public Integer getVariacionUnidades() { return variacionUnidades; }
    public void setVariacionUnidades(Integer variacionUnidades) { this.variacionUnidades = variacionUnidades; }
}
