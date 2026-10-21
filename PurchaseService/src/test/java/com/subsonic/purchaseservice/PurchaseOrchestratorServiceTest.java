package com.subsonic.purchaseservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subsonic.purchaseservice.config.BadRequestException;
import com.subsonic.purchaseservice.config.BookingConflictException;
import com.subsonic.purchaseservice.config.TransactionNotFoundException;
import com.subsonic.purchaseservice.dao.OutboxDao;
import com.subsonic.purchaseservice.dao.PurchaseDao;
import com.subsonic.purchaseservice.dtos.requests.*;
import com.subsonic.purchaseservice.dtos.responses.BloqueoCupoCatalogResponse;
import com.subsonic.purchaseservice.dtos.responses.BloqueoStockInventoryResponse;
import com.subsonic.purchaseservice.dtos.responses.ReservaResponse;
import com.subsonic.purchaseservice.dtos.responses.TransaccionResponse;
import com.subsonic.purchaseservice.models.*;
import com.subsonic.purchaseservice.services.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executors;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseOrchestratorServiceTest {

    @Mock
    private PurchaseDao purchaseDao;

    @Mock
    private OutboxDao outboxDao;

    @Mock
    private CatalogClientService catalogClientService;

    @Mock
    private InventoryClientService inventoryClientService;

    @Mock
    private PaymentGatewayAdapter paymentGatewayAdapter;

    private PurchaseOrchestratorService orchestratorService;

    @BeforeEach
    void setUp() {
        orchestratorService = new PurchaseOrchestratorService(
                purchaseDao,
                outboxDao,
                catalogClientService,
                inventoryClientService,
                paymentGatewayAdapter,
                Executors.newFixedThreadPool(4),
                new ObjectMapper()
        );
    }

    @Test
    void testIniciarReserva_Success_MixedCart() {
        ReservaCarritoCompletoRequest request = new ReservaCarritoCompletoRequest(
                "fest_subsonic_2026",
                List.of(new ItemEntradaRequest("weekend", 2)),
                List.of(new ItemMerchRequest("prod-1", 1)),
                new DireccionEnvioRequest("Calle Mayor 1", "Madrid", "28013", "España", "+34600112233")
        );

        when(catalogClientService.bloquearEntrada(eq("fest_subsonic_2026"), eq("weekend"), eq(2), any()))
                .thenReturn(new BloqueoCupoCatalogResponse(true, "weekend", BigDecimal.valueOf(125.00)));

        when(inventoryClientService.bloquearStock(eq("prod-1"), eq(1), any()))
                .thenReturn(new BloqueoStockInventoryResponse(true, "prod-1", BigDecimal.valueOf(25.50)));

        ReservaResponse response = orchestratorService.iniciarReserva(request, "user-001", "Bearer fake-token");

        assertNotNull(response);
        assertEquals("PENDING", response.getEstado());
        assertEquals("EUR", response.getMoneda());
        assertEquals(0, BigDecimal.valueOf(275.50).compareTo(response.getTotalPagar())); // 2 * 125 + 25.50
        assertNotNull(response.getIdTransaccion());
        assertNotNull(response.getExpiracionReserva());

        verify(purchaseDao, times(1)).saveTransaction(any(Transaction.class));
        verify(purchaseDao, times(1)).saveTransactionItems(anyList());
    }

    @Test
    void testIniciarReserva_RollbackCompensation_WhenInventoryFails() {
        ReservaCarritoCompletoRequest request = new ReservaCarritoCompletoRequest(
                "fest_subsonic_2026",
                List.of(new ItemEntradaRequest("vip", 1)),
                List.of(new ItemMerchRequest("prod-agotado", 1)),
                new DireccionEnvioRequest("Calle Mayor 1", "Madrid", "28013", "España", "+34600112233")
        );

        when(catalogClientService.bloquearEntrada(eq("fest_subsonic_2026"), eq("vip"), eq(1), any()))
                .thenReturn(new BloqueoCupoCatalogResponse(true, "vip", BigDecimal.valueOf(250.00)));

        when(inventoryClientService.bloquearStock(eq("prod-agotado"), eq(1), any()))
                .thenThrow(new BookingConflictException("Stock insuficiente"));

        BookingConflictException thrown = assertThrows(BookingConflictException.class, () ->
                orchestratorService.iniciarReserva(request, "user-001", "Bearer fake-token")
        );

        assertTrue(thrown.getMessage().contains("Stock insuficiente") || thrown.getMessage().contains("Conflicto"));

        // Se verifica que se invocó la compensación activa (/liberar) en Catálogo
        verify(catalogClientService, times(1)).liberarEntrada(eq("fest_subsonic_2026"), eq("vip"), eq(1), any());
        verify(purchaseDao, never()).saveTransaction(any());
    }

    @Test
    void testConfirmarPago_Success_TransactionalOutbox() {
        String txId = "tx-test-123";
        Transaction tx = new Transaction(
                txId, "user-001", TransactionType.TICKET,
                BigDecimal.valueOf(125.00), "EUR", TransactionStatus.PENDING,
                LocalDateTime.now().plusMinutes(10)
        );

        when(purchaseDao.findById(txId)).thenReturn(Optional.of(tx));
        when(purchaseDao.findItemsByTransactionId(txId)).thenReturn(List.of(
                new TransactionItem("item-1", txId, ItemType.TICKET, "fest_subsonic_2026",
                        TicketType.WEEKEND, 1, BigDecimal.valueOf(125.00), BigDecimal.valueOf(125.00))
        ));

        when(paymentGatewayAdapter.processPayment(any(PaymentRequest.class)))
                .thenReturn(PaymentResult.success("ch_1234567890", "https://receipts.com/tx-test-123"));

        ConfirmacionPagoRequest request = new ConfirmacionPagoRequest("tarjeta", "tok_valid");

        TransaccionResponse response = orchestratorService.confirmarPago(txId, request, "user-001", "Bearer fake-token");

        assertNotNull(response);
        assertEquals(txId, response.getIdTransaccion());
        assertEquals("PAID", response.getEstado());
        assertEquals("https://receipts.com/tx-test-123", response.getReciboUrl());

        // Verificar que se actualizó el pago en BD
        verify(purchaseDao, times(1)).updatePaymentSuccess(
                eq(txId), eq(TransactionStatus.PAID), eq(PaymentMethod.TARJETA),
                eq("tok_valid"), eq("ch_1234567890"), eq("https://receipts.com/tx-test-123")
        );

        // Verificar inserción en outbox_events
        verify(outboxDao, times(1)).save(any(OutboxEvent.class));
    }

    @Test
    void testConfirmarPago_Failure_CardDeclined_ReleasesResources() {
        String txId = "tx-test-declined";
        Transaction tx = new Transaction(
                txId, "user-001", TransactionType.TICKET,
                BigDecimal.valueOf(125.00), "EUR", TransactionStatus.PENDING,
                LocalDateTime.now().plusMinutes(10)
        );

        when(purchaseDao.findById(txId)).thenReturn(Optional.of(tx));
        when(purchaseDao.findItemsByTransactionId(txId)).thenReturn(List.of(
                new TransactionItem("item-1", txId, ItemType.TICKET, "fest_subsonic_2026",
                        TicketType.WEEKEND, 1, BigDecimal.valueOf(125.00), BigDecimal.valueOf(125.00))
        ));

        when(paymentGatewayAdapter.processPayment(any(PaymentRequest.class)))
                .thenReturn(PaymentResult.failure("CARD_DECLINED", "Fondos insuficientes"));

        ConfirmacionPagoRequest request = new ConfirmacionPagoRequest("tarjeta", "tok_fail");

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                orchestratorService.confirmarPago(txId, request, "user-001", "Bearer fake-token")
        );

        assertTrue(ex.getMessage().contains("Fondos insuficientes"));

        // Se verifica que la transacción se marca como FAILED
        verify(purchaseDao, times(1)).updateStatus(txId, TransactionStatus.FAILED);

        // Se verifica compensación activa (liberar recursos bloqueados)
        verify(catalogClientService, times(1)).liberarEntrada(eq("fest_subsonic_2026"), eq("weekend"), eq(1), any());
        verify(outboxDao, never()).save(any());
    }

    @Test
    void testConfirmarPago_ExpiredReservation() {
        String txId = "tx-expired";
        Transaction tx = new Transaction(
                txId, "user-001", TransactionType.TICKET,
                BigDecimal.valueOf(125.00), "EUR", TransactionStatus.PENDING,
                LocalDateTime.now().minusMinutes(5) // Vencida hace 5 minutos
        );

        when(purchaseDao.findById(txId)).thenReturn(Optional.of(tx));
        when(purchaseDao.findItemsByTransactionId(txId)).thenReturn(List.of(
                new TransactionItem("item-1", txId, ItemType.TICKET, "fest_subsonic_2026",
                        TicketType.WEEKEND, 1, BigDecimal.valueOf(125.00), BigDecimal.valueOf(125.00))
        ));

        ConfirmacionPagoRequest request = new ConfirmacionPagoRequest("tarjeta", "tok_valid");

        BookingConflictException ex = assertThrows(BookingConflictException.class, () ->
                orchestratorService.confirmarPago(txId, request, "user-001", "Bearer fake-token")
        );

        assertTrue(ex.getMessage().contains("ha expirado"));
        verify(purchaseDao, times(1)).updateStatus(txId, TransactionStatus.EXPIRED);
        verify(catalogClientService, times(1)).liberarEntrada(any(), any(), anyInt(), any());
        verify(paymentGatewayAdapter, never()).processPayment(any());
    }
}

