package com.subsonic.purchaseservice.dtos.requests;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BloqueoCupoCatalogRequest {
    @JsonProperty("tipo_entrada")
    private String tipoEntrada;

    @JsonProperty("cantidad")
    private int cantidad;

    public BloqueoCupoCatalogRequest() {
    }

    public BloqueoCupoCatalogRequest(String tipoEntrada, int cantidad) {
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

