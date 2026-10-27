package com.subsonic.shipinventoryservice.controllers;

import com.subsonic.shipinventoryservice.config.ForbiddenException;
import com.subsonic.shipinventoryservice.config.JwtAuthInterceptor;
import com.subsonic.shipinventoryservice.dtos.requests.ActualizacionStockRequest;
import com.subsonic.shipinventoryservice.dtos.requests.BloqueoStockRequest;
import com.subsonic.shipinventoryservice.dtos.responses.BloqueoStockResponse;
import com.subsonic.shipinventoryservice.dtos.responses.StockProductoResponse;
import com.subsonic.shipinventoryservice.services.InventarioService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión del stock físico de merchandising.
 * Rutas prefix: /api/inventario  |  /inventario
 */
@RestController
@RequestMapping({"/api/inventario", "/inventario"})
public class InventarioController {
    private static final Logger log = LoggerFactory.getLogger(InventarioController.class);

    private final InventarioService inventarioService;

    public InventarioController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    /**
     * GET /inventario/stock
     * Rol requerido: Cualquiera (público, no requiere JWT).
     * Consultar stock físico de merchandising.
     */
    @GetMapping("/stock")
    public ResponseEntity<List<StockProductoResponse>> consultarStock() {
        log.info("GET /inventario/stock — Consultando stock de merchandising");
        List<StockProductoResponse> stock = inventarioService.consultarStock();
        return ResponseEntity.ok(stock);
    }

    /**
     * PUT /inventario/{id_producto}
     * Rol requerido: Admin.
     * Actualizar stock físico en almacén (variación positiva o negativa).
     */
    @PutMapping("/{id_producto}")
    public ResponseEntity<StockProductoResponse> actualizarStock(
            @PathVariable("id_producto") String idProducto,
            @Valid @RequestBody ActualizacionStockRequest request,
            HttpServletRequest servletRequest) {

        requireAdmin(servletRequest);
        log.info("PUT /inventario/{} — variación: {}", idProducto, request.getVariacionUnidades());

        StockProductoResponse response = inventarioService.actualizarStock(idProducto, request.getVariacionUnidades());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /inventario/{id_producto}/bloquear
     * Endpoint interno: llamado por PurchaseService durante el proceso de reserva.
     * Requiere JWT (servicio a servicio), pero no requiere rol Admin.
     */
    @PostMapping("/{id_producto}/bloquear")
    public ResponseEntity<BloqueoStockResponse> bloquearStock(
            @PathVariable("id_producto") String idProducto,
            @Valid @RequestBody BloqueoStockRequest request,
            HttpServletRequest servletRequest) {

        String userId = (String) servletRequest.getAttribute(JwtAuthInterceptor.USER_ID_ATTRIBUTE);
        log.info("POST /inventario/{}/bloquear — {} unidades (caller: {})",
                idProducto, request.getCantidad(), userId);

        BloqueoStockResponse response = inventarioService.bloquearStock(idProducto, request.getCantidad());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /inventario/{id_producto}/liberar
     * Endpoint interno: rollback de compensación desde PurchaseService.
     * Requiere JWT, no requiere rol Admin.
     */
    @PostMapping("/{id_producto}/liberar")
    public ResponseEntity<Void> liberarStock(
            @PathVariable("id_producto") String idProducto,
            @Valid @RequestBody BloqueoStockRequest request,
            HttpServletRequest servletRequest) {

        String userId = (String) servletRequest.getAttribute(JwtAuthInterceptor.USER_ID_ATTRIBUTE);
        log.info("POST /inventario/{}/liberar — {} unidades (caller: {})",
                idProducto, request.getCantidad(), userId);

        inventarioService.liberarStock(idProducto, request.getCantidad());
        return ResponseEntity.ok().build();
    }

    // ------------------------------------------------------------------ //
    //  Helper para verificar rol Admin (extraído del token JWT)           //
    // ------------------------------------------------------------------ //

    private void requireAdmin(HttpServletRequest request) {
        String role = (String) request.getAttribute(JwtAuthInterceptor.USER_ROLE_ATTRIBUTE);
        if (!"admin".equalsIgnoreCase(role) && !"Admin".equalsIgnoreCase(role)) {
            throw new ForbiddenException("Se requiere rol Admin para realizar esta operación.");
        }
    }
}
