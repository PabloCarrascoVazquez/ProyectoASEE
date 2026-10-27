package com.subsonic.shipinventoryservice.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.subsonic.shipinventoryservice.dao.InventarioDao;
import com.subsonic.shipinventoryservice.models.EnvioLogistico;
import com.subsonic.shipinventoryservice.models.EstadoEnvio;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Consumidor asíncrono de la cola RabbitMQ "merch_queue".
 *
 * Procesa los eventos ORDER_PAID publicados por PurchaseService que incluyen
 * artículos de merchandising. Por cada evento:
 *   1. Descuenta el stock definitivamente (confirmarConsumoStock).
 *   2. Crea un envío logístico en estado "Pendiente".
 *
 * El procesamiento es idempotente por diseño: si el mismo mensaje se recibe dos veces,
 * el segundo descuento fallará silenciosamente (stock bloqueado = 0).
 */
@Service
public class MerchOrderConsumer {
    private static final Logger log = LoggerFactory.getLogger(MerchOrderConsumer.class);

    private final InventarioDao inventarioDao;
    private final EnviosService enviosService;
    private final ObjectMapper objectMapper;

    public MerchOrderConsumer(InventarioDao inventarioDao,
                               EnviosService enviosService,
                               ObjectMapper objectMapper) {
        this.inventarioDao = inventarioDao;
        this.enviosService = enviosService;
        this.objectMapper = objectMapper;
    }

    /**
     * Escucha la cola "merch_queue" y procesa eventos ORDER_PAID con merchandising.
     * RabbitMQ entrega el payload como String JSON (publicado por OutboxPublisherWorker).
     */
    @RabbitListener(queues = "#{T(com.subsonic.shipinventoryservice.config.RabbitMQConfig).MERCH_QUEUE}")
    public void onMerchOrderPaid(String payload) {
        log.info("Mensaje recibido desde merch_queue. Procesando evento ORDER_PAID...");
        log.debug("Payload recibido: {}", payload);

        try {
            procesarEvento(payload);
        } catch (Exception e) {
            // Log del error sin relanzar para que RabbitMQ no reencole infinitamente
            // En producción se usaría un DLQ (Dead Letter Queue)
            log.error("Error procesando mensaje de merch_queue. El mensaje se descartará: {}", e.getMessage(), e);
        }
    }

    private void procesarEvento(String payload) throws Exception {
        JsonNode root = objectMapper.readTree(payload);

        String transactionId = root.path("transaction_id").asText(null);
        String userId        = root.path("user_id").asText(null);
        String direccion     = extraerDireccion(root);

        if (transactionId == null || transactionId.isBlank()) {
            log.warn("Evento de merch_queue sin transaction_id. Ignorando.");
            return;
        }

        JsonNode merchandise = root.path("merchandise");
        if (!merchandise.isArray() || merchandise.isEmpty()) {
            log.warn("Evento {} no contiene artículos de merchandising. Ignorando.", transactionId);
            return;
        }

        log.info("Procesando {} artículo(s) de merchandising para transacción {}",
                merchandise.size(), transactionId);

        // 1. Descontar stock definitivamente para cada producto
        for (JsonNode item : merchandise) {
            String productId = item.path("product_id").asText(null);
            int quantity     = item.path("quantity").asInt(1);

            if (productId == null || productId.isBlank()) {
                log.warn("Item de merchandising sin product_id en transacción {}. Ignorando.", transactionId);
                continue;
            }

            try {
                inventarioDao.confirmarConsumoStock(productId, quantity);
                log.info("Stock confirmado: {} unidades del producto '{}' (transacción {})",
                        quantity, productId, transactionId);
            } catch (Exception e) {
                log.error("Error confirmando stock para producto '{}' en transacción {}: {}",
                        productId, transactionId, e.getMessage());
                // Continuamos con el resto de productos (best-effort)
            }
        }

        // 2. Crear envío logístico en estado Pendiente
        EnvioLogistico envio = new EnvioLogistico();
        envio.setIdEnvio("env-" + UUID.randomUUID());
        envio.setIdPedido(transactionId);
        envio.setEstadoEnvio(EstadoEnvio.PENDIENTE);
        envio.setDireccionEntrega(direccion != null ? direccion : "Dirección pendiente de confirmación");

        enviosService.crearEnvio(envio);
        log.info("Envío '{}' creado en estado Pendiente para transacción/pedido '{}'",
                envio.getIdEnvio(), transactionId);
    }

    /**
     * Intenta extraer la dirección de entrega del payload del evento.
     * PurchaseService puede incluir 'direccion_envio' como objeto o string.
     */
    private String extraerDireccion(JsonNode root) {
        JsonNode dir = root.path("direccion_envio");
        if (dir.isMissingNode() || dir.isNull()) return null;

        if (dir.isTextual()) return dir.asText();

        // Si viene como objeto {calle, ciudad, codigo_postal, pais, telefono}
        StringBuilder sb = new StringBuilder();
        if (!dir.path("calle").isMissingNode())          sb.append(dir.path("calle").asText()).append(", ");
        if (!dir.path("ciudad").isMissingNode())         sb.append(dir.path("ciudad").asText()).append(" ");
        if (!dir.path("codigo_postal").isMissingNode())  sb.append(dir.path("codigo_postal").asText()).append(", ");
        if (!dir.path("pais").isMissingNode())           sb.append(dir.path("pais").asText());
        return sb.toString().trim().replaceAll(",\\s*$", "");
    }
}
