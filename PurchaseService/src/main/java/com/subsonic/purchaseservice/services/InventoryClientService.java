package com.subsonic.purchaseservice.services;

import com.subsonic.purchaseservice.config.BookingConflictException;
import com.subsonic.purchaseservice.dtos.requests.BloqueoStockInventoryRequest;
import com.subsonic.purchaseservice.dtos.responses.BloqueoStockInventoryResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Service
public class InventoryClientService {
    private static final Logger log = LoggerFactory.getLogger(InventoryClientService.class);

    private final RestTemplate restTemplate;

    @Value("${inventory.service.url:http://localhost:8004/api}")
    private String inventoryBaseUrl;

    public InventoryClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Bloquea stock temporal de merchandising en el Servicio de Inventario.
     */
    public BloqueoStockInventoryResponse bloquearStock(String idProducto, int cantidad, String jwtToken) {
        String url = inventoryBaseUrl + "/inventario/" + idProducto + "/bloquear";
        log.info("Llamando a Inventario para bloquear stock: {} unidades del producto {}", cantidad, idProducto);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (jwtToken != null && !jwtToken.isBlank()) {
            headers.set("Authorization", jwtToken.startsWith("Bearer ") ? jwtToken : "Bearer " + jwtToken);
        }

        BloqueoStockInventoryRequest body = new BloqueoStockInventoryRequest(cantidad);
        HttpEntity<BloqueoStockInventoryRequest> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<BloqueoStockInventoryResponse> response = restTemplate.postForEntity(url, requestEntity, BloqueoStockInventoryResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Bloqueo exitoso en Inventario para producto {}", idProducto);
                return response.getBody();
            }
            throw new BookingConflictException("Respuesta inesperada de Inventario al bloquear stock: " + response.getStatusCode());
        } catch (HttpStatusCodeException ex) {
            log.error("Error HTTP desde Inventario ({}): {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new BookingConflictException("Stock agotado o insuficiente para el producto '" + idProducto + "': " + ex.getResponseBodyAsString());
        } catch (ResourceAccessException ex) {
            log.error("Error de conexión/timeout llamando a Inventario: {}", ex.getMessage());
            // Simulación fallback si el servicio aún no está levantado (Mock graceful para desarrollo/test)
            if (shouldSimulateFallback()) {
                log.warn("Servicio de Inventario no accesible. Aplicando mock simulado para producto {}", idProducto);
                return new BloqueoStockInventoryResponse(true, idProducto, BigDecimal.valueOf(25.50));
            }
            throw new BookingConflictException("No se pudo conectar con el Servicio de Inventario (Timeout o servicio no disponible)");
        } catch (Exception ex) {
            log.error("Error no controlado llamando a Inventario: {}", ex.getMessage());
            throw new BookingConflictException("Fallo al bloquear stock en Inventario: " + ex.getMessage());
        }
    }

    /**
     * Libera stock temporal en el Servicio de Inventario (Rollback de compensación).
     */
    public void liberarStock(String idProducto, int cantidad, String jwtToken) {
        String url = inventoryBaseUrl + "/inventario/" + idProducto + "/liberar";
        log.info("Llamando a Inventario para liberar stock: {} unidades del producto {}", cantidad, idProducto);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (jwtToken != null && !jwtToken.isBlank()) {
            headers.set("Authorization", jwtToken.startsWith("Bearer ") ? jwtToken : "Bearer " + jwtToken);
        }

        BloqueoStockInventoryRequest body = new BloqueoStockInventoryRequest(cantidad);
        HttpEntity<BloqueoStockInventoryRequest> requestEntity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, requestEntity, Void.class);
            log.info("Stock liberado con éxito en Inventario para producto {}", idProducto);
        } catch (Exception e) {
            log.warn("No se pudo ejecutar la liberación en Inventario (posiblemente fuera de línea): {}", e.getMessage());
        }
    }

    private boolean shouldSimulateFallback() {
        String fallback = System.getProperty("INVENTORY_MOCK_FALLBACK", System.getenv("INVENTORY_MOCK_FALLBACK"));
        return "true".equalsIgnoreCase(fallback);
    }
}

