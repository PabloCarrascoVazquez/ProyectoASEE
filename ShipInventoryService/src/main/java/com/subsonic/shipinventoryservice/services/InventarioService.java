package com.subsonic.shipinventoryservice.services;

import com.subsonic.shipinventoryservice.config.BadRequestException;
import com.subsonic.shipinventoryservice.config.ConflictException;
import com.subsonic.shipinventoryservice.config.NotFoundException;
import com.subsonic.shipinventoryservice.dao.InventarioDao;
import com.subsonic.shipinventoryservice.dtos.responses.BloqueoStockResponse;
import com.subsonic.shipinventoryservice.dtos.responses.StockProductoResponse;
import com.subsonic.shipinventoryservice.models.StockProducto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventarioService {
    private static final Logger log = LoggerFactory.getLogger(InventarioService.class);

    private final InventarioDao inventarioDao;

    public InventarioService(InventarioDao inventarioDao) {
        this.inventarioDao = inventarioDao;
    }

    /**
     * GET /inventario/stock — Devuelve todo el stock físico de merchandising.
     */
    public List<StockProductoResponse> consultarStock() {
        log.info("Consultando stock completo de merchandising...");
        List<StockProducto> productos = inventarioDao.findAll();
        return productos.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * PUT /inventario/{id_producto} — Actualiza el stock físico en almacén (solo Admin).
     */
    @Transactional
    public StockProductoResponse actualizarStock(String idProducto, int variacionUnidades) {
        log.info("Actualizando stock del producto '{}': variación = {}", idProducto, variacionUnidades);

        StockProducto producto = inventarioDao.findById(idProducto)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + idProducto));

        int nuevasUnidades = producto.getUnidadesDisponibles() + variacionUnidades;
        if (nuevasUnidades < 0) {
            throw new BadRequestException(
                    "La variación de stock (" + variacionUnidades + ") resultaría en stock negativo. " +
                    "Stock actual: " + producto.getUnidadesDisponibles()
            );
        }

        int filas = inventarioDao.actualizarStock(idProducto, variacionUnidades);
        if (filas == 0) {
            throw new NotFoundException("No se pudo actualizar el stock. Producto no encontrado: " + idProducto);
        }

        // Recuperamos el estado actualizado
        StockProducto actualizado = inventarioDao.findById(idProducto)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado tras actualización: " + idProducto));

        log.info("Stock del producto '{}' actualizado: {} unidades disponibles", idProducto, actualizado.getUnidadesDisponibles());
        return toResponse(actualizado);
    }

    /**
     * POST /inventario/{id_producto}/bloquear — Bloqueo temporal de stock (llamada interna desde PurchaseService).
     * Devuelve los datos necesarios para que PurchaseService construya el TransactionItem.
     */
    @Transactional
    public BloqueoStockResponse bloquearStock(String idProducto, int cantidad) {
        log.info("Solicitando bloqueo de {} unidades del producto '{}'", cantidad, idProducto);

        StockProducto producto = inventarioDao.findById(idProducto)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado con ID: " + idProducto));

        if (producto.getUnidadesDisponibles() < cantidad) {
            log.warn("Stock insuficiente para producto '{}': disponibles={}, solicitadas={}",
                    idProducto, producto.getUnidadesDisponibles(), cantidad);
            throw new ConflictException(
                    "Stock agotado o insuficiente para el producto '" + idProducto + "'. " +
                    "Disponibles: " + producto.getUnidadesDisponibles() + ", solicitadas: " + cantidad
            );
        }

        int filas = inventarioDao.bloquearStock(idProducto, cantidad);
        if (filas == 0) {
            // Race condition: otro hilo acaba de consumir el stock entre la lectura y el update
            throw new ConflictException("Stock agotado o insuficiente (condición de carrera) para el producto: " + idProducto);
        }

        log.info("Bloqueo exitoso de {} unidades del producto '{}'", cantidad, idProducto);
        return new BloqueoStockResponse(true, idProducto, producto.getPrecio());
    }

    /**
     * POST /inventario/{id_producto}/liberar — Libera stock bloqueado (rollback de compensación).
     */
    @Transactional
    public void liberarStock(String idProducto, int cantidad) {
        log.info("Liberando {} unidades bloqueadas del producto '{}'", cantidad, idProducto);

        // Verificamos que el producto existe (pero no fallamos si no: compensación best-effort)
        if (inventarioDao.findById(idProducto).isEmpty()) {
            log.warn("Se intentó liberar stock de un producto no existente: '{}'", idProducto);
            return;
        }

        inventarioDao.liberarStock(idProducto, cantidad);
        log.info("Stock liberado correctamente para producto '{}'", idProducto);
    }

    /**
     * Convierte entidad de dominio → DTO de respuesta.
     */
    private StockProductoResponse toResponse(StockProducto s) {
        return new StockProductoResponse(
                s.getIdProducto(),
                s.getNombreProducto(),
                s.getVariante(),
                s.getUnidadesDisponibles(),
                s.getPrecio(),
                s.getUbicacionAlmacen()
        );
    }
}
