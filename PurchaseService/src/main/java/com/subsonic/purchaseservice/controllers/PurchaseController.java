package com.subsonic.purchaseservice.controllers;

import com.subsonic.purchaseservice.config.JwtAuthInterceptor;
import com.subsonic.purchaseservice.dtos.requests.ConfirmacionPagoRequest;
import com.subsonic.purchaseservice.dtos.requests.ReservaCarritoCompletoRequest;
import com.subsonic.purchaseservice.dtos.responses.ReservaResponse;
import com.subsonic.purchaseservice.dtos.responses.TransaccionResponse;
import com.subsonic.purchaseservice.services.PurchaseOrchestratorService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/compras", "/compras"})
public class PurchaseController {
    private static final Logger log = LoggerFactory.getLogger(PurchaseController.class);

    private final PurchaseOrchestratorService orchestratorService;

    public PurchaseController(PurchaseOrchestratorService orchestratorService) {
        this.orchestratorService = orchestratorService;
    }

    /**
     * Fase 1: Iniciar reserva de carrito mixto (Entradas y/o Merchandising).
     * Bloquea temporalmente el aforo y el stock físico de forma concurrente con 10 minutos de expiración.
     */
    @PostMapping("/carrito/iniciar")
    public ResponseEntity<ReservaResponse> iniciarCompra(
            @Valid @RequestBody ReservaCarritoCompletoRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest servletRequest) {

        String userId = (String) servletRequest.getAttribute(JwtAuthInterceptor.USER_ID_ATTRIBUTE);
        log.info("Endpoint POST /carrito/iniciar invocado por el usuario {}", userId);

        ReservaResponse response = orchestratorService.iniciarReserva(request, userId, authHeader);
        return ResponseEntity.ok(response);
    }

    /**
     * Fase 2: Confirmar pago (Valida con pasarela bancaria y emite evento al Bus mediante Transactional Outbox).
     */
    @PostMapping("/{id_transaccion}/pagar")
    public ResponseEntity<TransaccionResponse> confirmarPago(
            @PathVariable("id_transaccion") String idTransaccion,
            @Valid @RequestBody ConfirmacionPagoRequest request,
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            HttpServletRequest servletRequest) {

        String userId = (String) servletRequest.getAttribute(JwtAuthInterceptor.USER_ID_ATTRIBUTE);
        log.info("Endpoint POST /{}/pagar invocado por el usuario {}", idTransaccion, userId);

        TransaccionResponse response = orchestratorService.confirmarPago(idTransaccion, request, userId, authHeader);
        return ResponseEntity.ok(response);
    }
}

