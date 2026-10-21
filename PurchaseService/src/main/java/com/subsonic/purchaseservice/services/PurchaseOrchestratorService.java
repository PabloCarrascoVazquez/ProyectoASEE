package com.subsonic.purchaseservice.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subsonic.purchaseservice.config.BadRequestException;
import com.subsonic.purchaseservice.config.BookingConflictException;
import com.subsonic.purchaseservice.config.ForbiddenException;
import com.subsonic.purchaseservice.config.TransactionNotFoundException;
import com.subsonic.purchaseservice.dao.OutboxDao;
import com.subsonic.purchaseservice.dao.PurchaseDao;
import com.subsonic.purchaseservice.dtos.requests.ConfirmacionPagoRequest;
import com.subsonic.purchaseservice.dtos.requests.ItemEntradaRequest;
import com.subsonic.purchaseservice.dtos.requests.ItemMerchRequest;
import com.subsonic.purchaseservice.dtos.requests.ReservaCarritoCompletoRequest;
import com.subsonic.purchaseservice.dtos.responses.BloqueoCupoCatalogResponse;
import com.subsonic.purchaseservice.dtos.responses.BloqueoStockInventoryResponse;
import com.subsonic.purchaseservice.dtos.responses.ReservaResponse;
import com.subsonic.purchaseservice.dtos.responses.TransaccionResponse;
import com.subsonic.purchaseservice.models.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.Executor;

@Service
public class PurchaseOrchestratorService {
    private static final Logger log = LoggerFactory.getLogger(PurchaseOrchestratorService.class);
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");

    private final PurchaseDao purchaseDao;
    private final OutboxDao outboxDao;
    private final CatalogClientService catalogClientService;
    private final InventoryClientService inventoryClientService;
    private final PaymentGatewayAdapter paymentGatewayAdapter;
    private final Executor purchaseTaskExecutor;
    private final ObjectMapper objectMapper;

    public PurchaseOrchestratorService(PurchaseDao purchaseDao,
                                       OutboxDao outboxDao,
                                       CatalogClientService catalogClientService,
                                       InventoryClientService inventoryClientService,
                                       PaymentGatewayAdapter paymentGatewayAdapter,
                                       @Qualifier("purchaseTaskExecutor") Executor purchaseTaskExecutor,
                                       ObjectMapper objectMapper) {
        this.purchaseDao = purchaseDao;
        this.outboxDao = outboxDao;
        this.catalogClientService = catalogClientService;
        this.inventoryClientService = inventoryClientService;
        this.paymentGatewayAdapter = paymentGatewayAdapter;
        this.purchaseTaskExecutor = purchaseTaskExecutor;
        this.objectMapper = objectMapper;
    }

    /**
     * Fase 1: Iniciar reserva de carrito mixto de forma concurrente con rollback activo.
     */
    public ReservaResponse iniciarReserva(ReservaCarritoCompletoRequest request, String userId, String jwtToken) {
        validarCarrito(request);

        String transactionId = "tx-" + UUID.randomUUID().toString();
        log.info("Iniciando orquestación de reserva para transacción {} (Usuario: {})", transactionId, userId);

        // Hilo A: Bloqueo concurrente de aforo de entradas en CatalogService
        CompletableFuture<List<TransactionItem>> futureTickets = CompletableFuture.supplyAsync(() -> {
            List<TransactionItem> items = new ArrayList<>();
            if (request.hasTickets()) {
                String festivalId = request.getIdFestival();
                for (ItemEntradaRequest entrada : request.getEntradas()) {
                    try {
                        BloqueoCupoCatalogResponse res = catalogClientService.bloquearEntrada(
                                festivalId, entrada.getTipoEntrada(), entrada.getCantidad(), jwtToken);

                        BigDecimal unitPrice = res.getPrecioUnitario() != null ? res.getPrecioUnitario() : BigDecimal.valueOf(100.00);
                        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(entrada.getCantidad()));

                        TransactionItem item = new TransactionItem(
                                UUID.randomUUID().toString(),
                                transactionId,
                                ItemType.TICKET,
                                festivalId,
                                TicketType.fromString(entrada.getTipoEntrada()),
                                entrada.getCantidad(),
                                unitPrice,
                                subtotal
                        );
                        items.add(item);
                    } catch (Exception e) {
                        log.error("Fallo al bloquear entrada {} en Catálogo: {}", entrada.getTipoEntrada(), e.getMessage());
                        // Liberar lo que ya se hubiera bloqueado en este hilo
                        compensarTickets(festivalId, items, jwtToken);
                        throw new CompletionException(e);
                    }
                }
            }
            return items;
        }, purchaseTaskExecutor);

        // Hilo B: Bloqueo concurrente de stock físico en InventoryService
        CompletableFuture<List<TransactionItem>> futureMerch = CompletableFuture.supplyAsync(() -> {
            List<TransactionItem> items = new ArrayList<>();
            if (request.hasMerchandise()) {
                for (ItemMerchRequest merch : request.getMerchandising()) {
                    try {
                        BloqueoStockInventoryResponse res = inventoryClientService.bloquearStock(
                                merch.getIdProducto(), merch.getCantidad(), jwtToken);

                        BigDecimal unitPrice = res.getPrecioUnitario() != null ? res.getPrecioUnitario() : BigDecimal.valueOf(25.50);
                        BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(merch.getCantidad()));

                        TransactionItem item = new TransactionItem(
                                UUID.randomUUID().toString(),
                                transactionId,
                                ItemType.MERCHANDISE,
                                merch.getIdProducto(),
                                null,
                                merch.getCantidad(),
                                unitPrice,
                                subtotal
                        );
                        items.add(item);
                    } catch (Exception e) {
                        log.error("Fallo al bloquear producto {} en Inventario: {}", merch.getIdProducto(), e.getMessage());
                        // Liberar lo que ya se hubiera bloqueado en este hilo
                        compensarMerchandising(items, jwtToken);
                        throw new CompletionException(e);
                    }
                }
            }
            return items;
        }, purchaseTaskExecutor);

        // Condición de Sincronización: Esperar a que ambos hilos terminen
        List<TransactionItem> ticketItems;
        List<TransactionItem> merchItems;
        try {
            CompletableFuture.allOf(futureTickets, futureMerch).join();
            ticketItems = futureTickets.join();
            merchItems = futureMerch.join();
        } catch (Exception ex) {
            log.error("Error en uno de los hilos de reserva concurrente. Iniciando rollback cruzado de compensación...");

            // Si Catálogo tuvo éxito pero Inventario falló, liberamos Catálogo
            if (futureTickets.isDone() && !futureTickets.isCompletedExceptionally()) {
                compensarTickets(request.getIdFestival(), futureTickets.join(), jwtToken);
            }
            // Si Inventario tuvo éxito pero Catálogo falló, liberamos Inventario
            if (futureMerch.isDone() && !futureMerch.isCompletedExceptionally()) {
                compensarMerchandising(futureMerch.join(), jwtToken);
            }

            Throwable root = ex instanceof CompletionException ? ex.getCause() : ex;
            throw new BookingConflictException("Conflicto al reservar recursos: " + root.getMessage());
        }

        // Ambos hilos tuvieron éxito: creamos la transacción en estado PENDING con 10 min de expiración
        List<TransactionItem> allItems = new ArrayList<>();
        allItems.addAll(ticketItems);
        allItems.addAll(merchItems);

        BigDecimal totalAmount = allItems.stream()
                .map(TransactionItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        TransactionType type;
        if (request.hasTickets() && request.hasMerchandise()) {
            type = TransactionType.MIXED;
        } else if (request.hasTickets()) {
            type = TransactionType.TICKET;
        } else {
            type = TransactionType.MERCHANDISE;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(10);

        Transaction transaction = new Transaction(
                transactionId,
                userId,
                type,
                totalAmount,
                "EUR",
                TransactionStatus.PENDING,
                expiresAt
        );

        persistirReserva(transaction, allItems);

        log.info("Transacción {} creada en estado PENDING hasta {}", transactionId, expiresAt);

        return new ReservaResponse(
                transactionId,
                TransactionStatus.PENDING.name(),
                expiresAt.atOffset(ZoneOffset.UTC).format(ISO_FORMATTER),
                "EUR",
                totalAmount
        );
    }

    @Transactional
    protected void persistirReserva(Transaction tx, List<TransactionItem> items) {
        purchaseDao.saveTransaction(tx);
        purchaseDao.saveTransactionItems(items);
    }

    /**
     * Fase 2: Confirmar pago mediante Adapter y registrar Transactional Outbox.
     */
    @Transactional
    public TransaccionResponse confirmarPago(String transactionId, ConfirmacionPagoRequest request, String userId, String jwtToken) {
        Transaction tx = purchaseDao.findById(transactionId)
                .orElseThrow(() -> new TransactionNotFoundException("La transacción '" + transactionId + "' no existe."));

        if (!tx.getUserId().equals(userId)) {
            throw new ForbiddenException("La transacción no pertenece al usuario autenticado.");
        }

        if (tx.getStatus() == TransactionStatus.PAID) {
            throw new BookingConflictException("El pago ya fue procesado anteriormente para esta transacción.");
        }

        if (tx.getStatus() != TransactionStatus.PENDING) {
            throw new BookingConflictException("La transacción se encuentra en estado " + tx.getStatus() + " y no admite pagos.");
        }

        // Verificamos si la reserva ha expirado (> 10 min)
        if (tx.getReservationExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Transacción {} ha expirado. Procediendo a compensar y cancelar.", transactionId);
            tx.setStatus(TransactionStatus.EXPIRED);
            purchaseDao.updateStatus(transactionId, TransactionStatus.EXPIRED);
            liberarRecursosDeTransaccion(transactionId, jwtToken);
            throw new BookingConflictException("La reserva ha expirado. El aforo y el stock han sido liberados.");
        }

        // Llamada a la pasarela bancaria externa mediante el Adapter
        PaymentRequest paymentRequest = new PaymentRequest(
                tx.getTotalAmount(),
                tx.getCurrency(),
                request.getMetodoPago(),
                request.getTokenPasarela(),
                transactionId,
                userId
        );

        PaymentResult paymentResult = paymentGatewayAdapter.processPayment(paymentRequest);

        if (!paymentResult.isSuccess()) {
            log.warn("Pago denegado para transacción {}: {}", transactionId, paymentResult.getErrorMessage());
            tx.setStatus(TransactionStatus.FAILED);
            purchaseDao.updateStatus(transactionId, TransactionStatus.FAILED);
            // Si el pago falla, liberamos recursos (rollback de compensación)
            liberarRecursosDeTransaccion(transactionId, jwtToken);
            throw new BadRequestException("Pago rechazado por la pasarela: " + paymentResult.getErrorMessage());
        }

        // PAGO ACEPTADO: Actualizamos transacción y persistimos evento en outbox_events dentro de la misma transacción ACID
        PaymentMethod method = PaymentMethod.fromString(request.getMetodoPago());
        purchaseDao.updatePaymentSuccess(
                transactionId,
                TransactionStatus.PAID,
                method,
                request.getTokenPasarela(),
                paymentResult.getGatewayTransactionId(),
                paymentResult.getReceiptUrl()
        );

        // Preparamos el payload del evento para RabbitMQ
        List<TransactionItem> items = purchaseDao.findItemsByTransactionId(transactionId);
        String payloadJson = construirPayloadOutbox(tx, paymentResult, method, items);

        OutboxEvent outboxEvent = new OutboxEvent(
                UUID.randomUUID().toString(),
                "TRANSACTION",
                transactionId,
                "ORDER_PAID",
                payloadJson,
                false
        );
        outboxDao.save(outboxEvent);

        log.info("Pago confirmado para transacción {}. Evento outbox registrado con ID {}", transactionId, outboxEvent.getId());

        LocalDateTime paidAt = LocalDateTime.now();
        return new TransaccionResponse(
                transactionId,
                TransactionStatus.PAID.name(),
                tx.getTotalAmount(),
                paymentResult.getReceiptUrl(),
                paidAt.atOffset(ZoneOffset.UTC).format(ISO_FORMATTER)
        );
    }

    private String construirPayloadOutbox(Transaction tx, PaymentResult paymentResult, PaymentMethod method, List<TransactionItem> items) {
        try {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("transaction_id", tx.getId());
            map.put("user_id", tx.getUserId());
            map.put("total_amount", tx.getTotalAmount());
            map.put("currency", tx.getCurrency());
            map.put("payment_method", method != null ? method.getValue() : "tarjeta");
            map.put("gateway_transaction_id", paymentResult.getGatewayTransactionId());
            map.put("receipt_url", paymentResult.getReceiptUrl());
            map.put("timestamp", LocalDateTime.now().atOffset(ZoneOffset.UTC).format(ISO_FORMATTER));

            List<Map<String, Object>> ticketsList = new ArrayList<>();
            List<Map<String, Object>> merchList = new ArrayList<>();

            for (TransactionItem item : items) {
                Map<String, Object> itemMap = new LinkedHashMap<>();
                itemMap.put("item_id", item.getItemId());
                itemMap.put("quantity", item.getQuantity());
                itemMap.put("unit_price", item.getUnitPrice());
                itemMap.put("subtotal", item.getSubtotal());

                if (item.getItemType() == ItemType.TICKET) {
                    itemMap.put("festival_id", item.getItemId());
                    itemMap.put("ticket_type", item.getTicketType() != null ? item.getTicketType().getValue() : null);
                    ticketsList.add(itemMap);
                } else {
                    itemMap.put("product_id", item.getItemId());
                    merchList.add(itemMap);
                }
            }

            map.put("tickets", ticketsList);
            map.put("merchandise", merchList);

            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            log.error("Error al serializar payload de outbox: {}", e.getMessage());
            return "{\"transaction_id\":\"" + tx.getId() + "\"}";
        }
    }

    public void liberarRecursosDeTransaccion(String transactionId, String jwtToken) {
        List<TransactionItem> items = purchaseDao.findItemsByTransactionId(transactionId);
        for (TransactionItem item : items) {
            try {
                if (item.getItemType() == ItemType.TICKET) {
                    catalogClientService.liberarEntrada(
                            item.getItemId(),
                            item.getTicketType() != null ? item.getTicketType().getValue() : "day",
                            item.getQuantity(),
                            jwtToken
                    );
                } else if (item.getItemType() == ItemType.MERCHANDISE) {
                    inventoryClientService.liberarStock(
                            item.getItemId(),
                            item.getQuantity(),
                            jwtToken
                    );
                }
            } catch (Exception e) {
                log.warn("Error compensando item {} de transacción {}: {}", item.getId(), transactionId, e.getMessage());
            }
        }
    }

    private void compensarTickets(String festivalId, List<TransactionItem> items, String jwtToken) {
        if (items == null || items.isEmpty()) return;
        for (TransactionItem item : items) {
            catalogClientService.liberarEntrada(
                    festivalId != null ? festivalId : item.getItemId(),
                    item.getTicketType() != null ? item.getTicketType().getValue() : "day",
                    item.getQuantity(),
                    jwtToken
            );
        }
    }

    private void compensarMerchandising(List<TransactionItem> items, String jwtToken) {
        if (items == null || items.isEmpty()) return;
        for (TransactionItem item : items) {
            inventoryClientService.liberarStock(
                    item.getItemId(),
                    item.getQuantity(),
                    jwtToken
            );
        }
    }

    private void validarCarrito(ReservaCarritoCompletoRequest req) {
        if (req == null) {
            throw new BadRequestException("El cuerpo de la petición no puede estar vacío.");
        }

        boolean hasTickets = req.hasTickets();
        boolean hasMerch = req.hasMerchandise();

        if (!hasTickets && !hasMerch) {
            throw new BadRequestException("El carrito debe incluir al menos una entrada o un artículo de merchandising.");
        }

        if (hasTickets && (req.getIdFestival() == null || req.getIdFestival().isBlank())) {
            throw new BadRequestException("El parámetro 'id_festival' es obligatorio cuando se seleccionan entradas.");
        }

        if (hasMerch && req.getDireccionEnvio() == null) {
            throw new BadRequestException("La 'direccion_envio' es obligatoria cuando el carrito incluye merchandising.");
        }
    }
}

