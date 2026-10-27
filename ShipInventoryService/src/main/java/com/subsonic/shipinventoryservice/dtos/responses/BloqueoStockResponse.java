package com.subsonic.shipinventoryservice.dtos.responses;

import java.math.BigDecimal;

/**
 * Response al bloquear stock temporalmente (schema BloqueoStockResponse del YAML).
 */
public class BloqueoStockResponse {

    private boolean bloqueado;
    private String idProducto;
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
