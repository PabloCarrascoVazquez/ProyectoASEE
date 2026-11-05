package com.subsonic.shipinventoryservice.dtos.responses;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

/**
 * Response con los datos de stock de un producto (coincide con el schema StockProducto del YAML).
 */
public class StockProductoResponse {

    @JsonProperty("id_producto")
    private String idProducto;

    @JsonProperty("nombre_producto")
    private String nombreProducto;

    @JsonProperty("variante")
    private String variante;

    @JsonProperty("unidades_disponibles")
    private int unidadesDisponibles;

    @JsonProperty("precio")
    private BigDecimal precio;

    @JsonProperty("ubicacion_almacen")
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
