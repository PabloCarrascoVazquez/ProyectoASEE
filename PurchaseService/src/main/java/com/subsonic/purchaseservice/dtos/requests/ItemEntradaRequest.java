package com.subsonic.purchaseservice.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ItemEntradaRequest {
    @NotBlank(message = "El tipo de entrada es obligatorio")
    @JsonProperty("tipo_entrada")
    private String tipoEntrada;

    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    @JsonProperty("cantidad")
    private int cantidad = 1;

    public ItemEntradaRequest() {
    }

    public ItemEntradaRequest(String tipoEntrada, int cantidad) {
        this.tipoEntrada = tipoEntrada;
        this.cantidad = cantidad;
    }

    public String getTipoEntrada() {
        return tipoEntrada;
    }

    public void setTipoEntrada(String tipoEntrada) {
        this.tipoEntrada = tipoEntrada;
    }

    public int getCantidad() {
        return cantidad;
    }

    public void setCantidad(int cantidad) {
        this.cantidad = cantidad;
    }
}

