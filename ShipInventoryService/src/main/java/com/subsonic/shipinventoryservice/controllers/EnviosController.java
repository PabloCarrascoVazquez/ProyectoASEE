package com.subsonic.shipinventoryservice.controllers;

import com.subsonic.shipinventoryservice.config.ForbiddenException;
import com.subsonic.shipinventoryservice.config.JwtAuthInterceptor;
import com.subsonic.shipinventoryservice.dtos.requests.ActualizacionTrackingRequest;
import com.subsonic.shipinventoryservice.dtos.responses.EnvioLogisticoResponse;
import com.subsonic.shipinventoryservice.services.EnviosService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para la gestión de envíos logísticos.
 * Rutas prefix: /api/envios  |  /envios
 */
@RestController
@RequestMapping({"/api/envios", "/envios"})
public class EnviosController {
    private static final Logger log = LoggerFactory.getLogger(EnviosController.class);

    private final EnviosService enviosService;

    public EnviosController(EnviosService enviosService) {
        this.enviosService = enviosService;
    }

    /**
     * GET /envios
     * Rol requerido: Admin.
     * Listar los envíos pendientes de despachar.
     */
    @GetMapping
    public ResponseEntity<List<EnvioLogisticoResponse>> listarEnviosPendientes(
            HttpServletRequest request) {

        requireAdmin(request);
        log.info("GET /envios — Listando envíos pendientes de despachar");

        List<EnvioLogisticoResponse> envios = enviosService.listarEnviosPendientes();
        return ResponseEntity.ok(envios);
    }

    /**
     * PUT /envios/{id_envio}/tracking
     * Rol requerido: Admin.
     * Actualizar el estado logístico de un envío.
     */
    @PutMapping("/{id_envio}/tracking")
    public ResponseEntity<EnvioLogisticoResponse> actualizarTracking(
            @PathVariable("id_envio") String idEnvio,
            @Valid @RequestBody ActualizacionTrackingRequest trackingRequest,
            HttpServletRequest servletRequest) {

        requireAdmin(servletRequest);
        log.info("PUT /envios/{}/tracking — nuevo estado: {}", idEnvio, trackingRequest.getEstadoEnvio());

        EnvioLogisticoResponse response = enviosService.actualizarTracking(idEnvio, trackingRequest);
        return ResponseEntity.ok(response);
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
