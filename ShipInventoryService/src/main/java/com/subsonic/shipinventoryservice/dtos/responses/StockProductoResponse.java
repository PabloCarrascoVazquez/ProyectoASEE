package com.subsonic.shipinventoryservice.dtos.responses;

import java.math.BigDecimal;

/**
 * Response con los datos de stock de un producto (coincide con el schema StockProducto del YAML).
 */
public class StockProductoResponse {

    private String idProducto;
    private String nombreProducto;
    private String variante;
    private int unidadesDisponibles;
    private BigDecimal precio;
    private String ubicacionAlmacen;

    public StockProductoResponse() {}

    public StockProductoResponse(String idProducto, String nombreProducto, String variante,
                                  int unidadesDisponibles, BigDecimal precio, String ubicacionAlmacen) {
        this.idProducto = idProducto;
        this.nombreProducto = nombreProducto;
        this.variante = variante;
        this.unidadesDisponibles = unidadesDisponibles;
        this.precio = precio;
        this.ubicacionAlmacen = ubicacionAlmacen;
    }

    public String getIdProducto() { return idProducto; }
    public void setIdProducto(String idProducto) { this.idProducto = idProducto; }

    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    public String getVariante() { return variante; }
    public void setVariante(String variante) { this.variante = variante; }

    public int getUnidadesDisponibles() { return unidadesDisponibles; }
    public void setUnidadesDisponibles(int unidadesDisponibles) { this.unidadesDisponibles = unidadesDisponibles; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public String getUbicacionAlmacen() { return ubicacionAlmacen; }
    public void setUbicacionAlmacen(String ubicacionAlmacen) { this.ubicacionAlmacen = ubicacionAlmacen; }
}
