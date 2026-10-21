package com.subsonic.purchaseservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.subsonic.purchaseservice.config.RabbitMQConfig;
import com.subsonic.purchaseservice.dao.OutboxDao;
import com.subsonic.purchaseservice.dao.PurchaseDao;
import com.subsonic.purchaseservice.models.OutboxEvent;
import com.subsonic.purchaseservice.models.Transaction;
import com.subsonic.purchaseservice.models.TransactionStatus;
import com.subsonic.purchaseservice.models.TransactionType;
import com.subsonic.purchaseservice.services.ExpirationWorker;
import com.subsonic.purchaseservice.services.OutboxPublisherWorker;
import com.subsonic.purchaseservice.services.PurchaseOrchestratorService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OutboxAndExpirationWorkersTest {

    @Mock
    private OutboxDao outboxDao;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @Mock
    private PurchaseDao purchaseDao;

    @Mock
    private PurchaseOrchestratorService orchestratorService;

    @Test
    void testOutboxPublisherWorker_PublishesAndMarksAsPublished() {
        OutboxPublisherWorker worker = new OutboxPublisherWorker(outboxDao, rabbitTemplate, new ObjectMapper());

        String payload = """
            {
                "transaction_id": "tx-123",
                "tickets": [{"festival_id": "fest_2026", "quantity": 1}],
                "merchandise": [{"product_id": "prod_1", "quantity": 2}]
            }
        """;

        OutboxEvent event = new OutboxEvent("evt-123", "TRANSACTION", "tx-123", "ORDER_PAID", payload, false);

        when(outboxDao.findUnpublished(50)).thenReturn(List.of(event));

        worker.processOutboxEvents();

        // Verifica publicación en ambas colas
        verify(rabbitTemplate, times(1)).convertAndSend(
                eq(RabbitMQConfig.EXCHANGE_NAME), eq(RabbitMQConfig.ROUTING_KEY_TICKET), eq(payload));

        verify(rabbitTemplate, times(1)).convertAndSend(
                eq(RabbitMQConfig.EXCHANGE_NAME), eq(RabbitMQConfig.ROUTING_KEY_MERCH), eq(payload));

        // Verifica que se marca como publicado
        verify(outboxDao, times(1)).markAsPublished("evt-123");
    }

    @Test
    void testExpirationWorker_CleansUpExpiredTransactions() {
        ExpirationWorker worker = new ExpirationWorker(purchaseDao, orchestratorService);

        Transaction expiredTx = new Transaction(
                "tx-expired-999", "user-001", TransactionType.TICKET,
                BigDecimal.valueOf(100.00), "EUR", TransactionStatus.PENDING,
                LocalDateTime.now().minusMinutes(15)
        );

        when(purchaseDao.findExpiredPendingTransactions(any(LocalDateTime.class)))
                .thenReturn(List.of(expiredTx));

        worker.cleanupExpiredReservations();

        verify(purchaseDao, times(1)).updateStatus("tx-expired-999", TransactionStatus.EXPIRED);
        verify(orchestratorService, times(1)).liberarRecursosDeTransaccion("tx-expired-999", null);
    }
}

