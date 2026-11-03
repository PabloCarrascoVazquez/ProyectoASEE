package com.subsonic.purchaseservice.services;

import com.subsonic.purchaseservice.config.BookingConflictException;
import com.subsonic.purchaseservice.dtos.requests.BloqueoCupoCatalogRequest;
import com.subsonic.purchaseservice.dtos.responses.BloqueoCupoCatalogResponse;
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
public class CatalogClientService {
    private static final Logger log = LoggerFactory.getLogger(CatalogClientService.class);

    private final RestTemplate restTemplate;

    @Value("${catalog.service.url:http://localhost:8002/api}")
    private String catalogBaseUrl;

    public CatalogClientService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Bloquea aforo de entradas en el Servicio de Catálogo.
     */
    public BloqueoCupoCatalogResponse bloquearEntrada(String festivalId, String tipoEntrada, int cantidad, String jwtToken) {
        String url = catalogBaseUrl + "/festivales/" + festivalId + "/entradas/bloquear";
        log.info("Llamando a Catálogo para bloquear aforo: {} entradas tipo {} en festival {}", cantidad, tipoEntrada, festivalId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (jwtToken != null && !jwtToken.isBlank()) {
            headers.set("Authorization", jwtToken.startsWith("Bearer ") ? jwtToken : "Bearer " + jwtToken);
        }

        BloqueoCupoCatalogRequest body = new BloqueoCupoCatalogRequest(tipoEntrada, cantidad);
        HttpEntity<BloqueoCupoCatalogRequest> requestEntity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<BloqueoCupoCatalogResponse> response = restTemplate.postForEntity(url, requestEntity, BloqueoCupoCatalogResponse.class);
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Bloqueo exitoso en Catálogo para entrada {}", tipoEntrada);
                return response.getBody();
            }
            throw new BookingConflictException("Respuesta inesperada de Catálogo al bloquear cupo: " + response.getStatusCode());
        } catch (HttpStatusCodeException ex) {
            log.error("Error HTTP desde Catálogo ({}): {}", ex.getStatusCode(), ex.getResponseBodyAsString());
            throw new BookingConflictException("Aforo agotado o error en Catálogo para entrada '" + tipoEntrada + "': " + ex.getResponseBodyAsString());
        } catch (ResourceAccessException ex) {
            log.error("Error de conexión/timeout llamando a Catálogo: {}", ex.getMessage());
            // Simulación fallback si el servicio aún no está levantado (Mock graceful para desarrollo/test)
            if (shouldSimulateFallback()) {
                log.warn("Servicio de Catálogo no accesible. Aplicando mock simulado para festival {}", festivalId);
                BigDecimal precioUnitario = switch (tipoEntrada.toLowerCase()) {
                    case "day" -> BigDecimal.valueOf(65.00);
                    case "weekend" -> BigDecimal.valueOf(125.00);
                    case "vip" -> BigDecimal.valueOf(250.00);
                    default -> BigDecimal.valueOf(100.00);
                };
                return new BloqueoCupoCatalogResponse(true, tipoEntrada, precioUnitario);
            }
            throw new BookingConflictException("No se pudo conectar con el Servicio de Catálogo (Timeout o servicio no disponible)");
        } catch (Exception ex) {
            log.error("Error no controlado llamando a Catálogo: {}", ex.getMessage());
            throw new BookingConflictException("Fallo al bloquear entradas en Catálogo: " + ex.getMessage());
        }
    }

    /**
     * Libera cupo bloqueado en el Servicio de Catálogo (Rollback de compensación).
     */
    public void liberarEntrada(String festivalId, String tipoEntrada, int cantidad, String jwtToken) {
        String url = catalogBaseUrl + "/festivales/" + festivalId + "/entradas/liberar";
        log.info("Llamando a Catálogo para liberar cupo: {} entradas tipo {} en festival {}", cantidad, tipoEntrada, festivalId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (jwtToken != null && !jwtToken.isBlank()) {
            headers.set("Authorization", jwtToken.startsWith("Bearer ") ? jwtToken : "Bearer " + jwtToken);
        }

        BloqueoCupoCatalogRequest body = new BloqueoCupoCatalogRequest(tipoEntrada, cantidad);
        HttpEntity<BloqueoCupoCatalogRequest> requestEntity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, requestEntity, Void.class);
            log.info("Cupo liberado con éxito en Catálogo para entrada {}", tipoEntrada);
        } catch (Exception e) {
            log.warn("No se pudo ejecutar la liberación en Catálogo (posiblemente fuera de línea): {}", e.getMessage());
        }
    }

    private boolean shouldSimulateFallback() {
        String fallback = System.getProperty("CATALOG_MOCK_FALLBACK", System.getenv("CATALOG_MOCK_FALLBACK"));
        return "true".equalsIgnoreCase(fallback);
    }
}

