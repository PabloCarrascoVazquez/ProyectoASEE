package com.subsonic.shipinventoryservice.dtos.responses;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

/**
 * Response al bloquear stock temporalmente (schema BloqueoStockResponse del YAML).
 */
public class BloqueoStockResponse {

    @JsonProperty("bloqueado")
    private boolean bloqueado;

    @JsonProperty("id_producto")
    private String idProducto;

    @JsonProperty("precio_unitario")
    private BigDecimal precioUnitario;

    public BloqueoStockResponse() {}

    public BloqueoStockResponse(boolean bloqueado, String idProducto, BigDecimal precioUnitario) {
        this.bloqueado = bloqueado;
        this.idProducto = idProducto;
        this.precioUnitario = precioUnitario;
    }

    public boolean isBloqueado() { return bloqueado; }
    public void setBloqueado(boolean bloqueado) { this.bloqueado = bloqueado; }

    public String getIdProducto() { return idProducto; }
    public void setIdProducto(String idProducto) { this.idProducto = idProducto; }

    public BigDecimal getPrecioUnitario() { return precioUnitario; }
    public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
}
