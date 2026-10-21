package com.subsonic.purchaseservice.dtos.responses;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public class BloqueoCupoCatalogResponse {
    @JsonProperty("bloqueado")
    private boolean bloqueado;

    @JsonProperty("tipo_entrada")
    private String tipoEntrada;

    @JsonProperty("precio_unitario")
    private BigDecimal precioUnitario;

    public BloqueoCupoCatalogResponse() {
    }

    public BloqueoCupoCatalogResponse(boolean bloqueado, String tipoEntrada, BigDecimal precioUnitario) {
        this.bloqueado = bloqueado;
        this.tipoEntrada = tipoEntrada;
        this.precioUnitario = precioUnitario;
    }

    public boolean isBloqueado() {
        return bloqueado;
    }

    public void setBloqueado(boolean bloqueado) {
        this.bloqueado = bloqueado;
    }

    public String getTipoEntrada() {
        return tipoEntrada;
    }

    public void setTipoEntrada(String tipoEntrada) {
        this.tipoEntrada = tipoEntrada;
    }

    public BigDecimal getPrecioUnitario() {
        return precioUnitario;
    }

    public void setPrecioUnitario(BigDecimal precioUnitario) {
        this.precioUnitario = precioUnitario;
    }
}

