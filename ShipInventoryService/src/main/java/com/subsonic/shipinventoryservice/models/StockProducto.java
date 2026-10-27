package com.subsonic.shipinventoryservice.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad que representa el stock físico de un producto de merchandising en el almacén.
 */
public class StockProducto {

    private String idProducto;
    private String nombreProducto;
    private String variante;
    private int unidadesDisponibles;
    private int unidadesBloqueadas;
    private BigDecimal precio;
    private String ubicacionAlmacen;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public StockProducto() {}

    public StockProducto(String idProducto, String nombreProducto, String variante,
                          int unidadesDisponibles, int unidadesBloqueadas,
                          BigDecimal precio, String ubicacionAlmacen) {
        this.idProducto = idProducto;
        this.nombreProducto = nombreProducto;
        this.variante = variante;
        this.unidadesDisponibles = unidadesDisponibles;
        this.unidadesBloqueadas = unidadesBloqueadas;
        this.precio = precio;
        this.ubicacionAlmacen = ubicacionAlmacen;
    }

    // --- Getters & Setters ---

    public String getIdProducto() { return idProducto; }
    public void setIdProducto(String idProducto) { this.idProducto = idProducto; }

    public String getNombreProducto() { return nombreProducto; }
    public void setNombreProducto(String nombreProducto) { this.nombreProducto = nombreProducto; }

    public String getVariante() { return variante; }
    public void setVariante(String variante) { this.variante = variante; }

    public int getUnidadesDisponibles() { return unidadesDisponibles; }
    public void setUnidadesDisponibles(int unidadesDisponibles) { this.unidadesDisponibles = unidadesDisponibles; }

    public int getUnidadesBloqueadas() { return unidadesBloqueadas; }
    public void setUnidadesBloqueadas(int unidadesBloqueadas) { this.unidadesBloqueadas = unidadesBloqueadas; }

    public BigDecimal getPrecio() { return precio; }
    public void setPrecio(BigDecimal precio) { this.precio = precio; }

    public String getUbicacionAlmacen() { return ubicacionAlmacen; }
    public void setUbicacionAlmacen(String ubicacionAlmacen) { this.ubicacionAlmacen = ubicacionAlmacen; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
