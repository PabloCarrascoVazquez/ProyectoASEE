package com.subsonic.shipinventoryservice.dao;

import com.subsonic.shipinventoryservice.models.StockProducto;

import java.util.List;
import java.util.Optional;

/**
 * Contrato de acceso a datos para el stock físico de merchandising.
 */
public interface InventarioDao {

    /** Devuelve todo el stock disponible (unidades_disponibles > 0 y producto existe). */
    List<StockProducto> findAll();

    /** Busca un producto por su ID. */
    Optional<StockProducto> findById(String idProducto);

    /**
     * Aplica una variación (positiva o negativa) al stock disponible.
     * Retorna el número de filas actualizadas.
     */
    int actualizarStock(String idProducto, int variacionUnidades);

    /**
     * Bloquea temporalmente N unidades (resta de disponibles, suma a bloqueadas).
     * Retorna filas afectadas (0 si no hay stock suficiente).
     */
    int bloquearStock(String idProducto, int cantidad);

    /**
     * Libera N unidades bloqueadas (suma a disponibles, resta de bloqueadas).
     */
    void liberarStock(String idProducto, int cantidad);

    /**
     * Confirma el consumo definitivo: descuenta N unidades de bloqueadas
     * (el stock ya fue descontado de disponibles al bloquear).
     */
    void confirmarConsumoStock(String idProducto, int cantidad);
}
