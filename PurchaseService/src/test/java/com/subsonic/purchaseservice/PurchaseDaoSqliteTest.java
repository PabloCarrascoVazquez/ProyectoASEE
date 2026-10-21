package com.subsonic.purchaseservice;

import com.subsonic.purchaseservice.dao.OutboxDao;
import com.subsonic.purchaseservice.dao.PurchaseDao;
import com.subsonic.purchaseservice.dao.sqlite.OutboxDaoSqlite;
import com.subsonic.purchaseservice.dao.sqlite.PurchaseDaoSqlite;
import com.subsonic.purchaseservice.models.*;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class PurchaseDaoSqliteTest {

    private String testDbPath;
    private JdbcTemplate jdbcTemplate;
    private PurchaseDao purchaseDao;
    private OutboxDao outboxDao;

    @BeforeEach
    void setUp() {
        testDbPath = "test_purchases_" + UUID.randomUUID() + ".db";
        DriverManagerDataSource ds = new DriverManagerDataSource();
        ds.setDriverClassName("org.sqlite.JDBC");
        ds.setUrl("jdbc:sqlite:" + testDbPath);

        jdbcTemplate = new JdbcTemplate(ds);
        jdbcTemplate.execute("PRAGMA foreign_keys = ON;");

        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS transactions (
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                type VARCHAR(20) NOT NULL,
                total_amount DECIMAL(10, 2) NOT NULL,
                currency VARCHAR(3) NOT NULL DEFAULT 'EUR',
                status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
                reservation_expires_at DATETIME NOT NULL,
                payment_method VARCHAR(20) NULL,
                gateway_token VARCHAR(255) NULL,
                gateway_transaction_id VARCHAR(255) NULL,
                receipt_url VARCHAR(500) NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """);

        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS transaction_items (
                id VARCHAR(36) PRIMARY KEY,
                transaction_id VARCHAR(36) NOT NULL,
                item_type VARCHAR(20) NOT NULL,
                item_id VARCHAR(36) NOT NULL,
                ticket_type VARCHAR(20) NULL,
                quantity INT NOT NULL DEFAULT 1,
                unit_price DECIMAL(10, 2) NOT NULL,
                subtotal DECIMAL(10, 2) NOT NULL,
                FOREIGN KEY (transaction_id) REFERENCES transactions(id) ON DELETE CASCADE
            );
        """);

        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS outbox_events (
                id VARCHAR(36) PRIMARY KEY,
                aggregate_type VARCHAR(50) NOT NULL DEFAULT 'TRANSACTION',
                aggregate_id VARCHAR(36) NOT NULL,
                event_type VARCHAR(50) NOT NULL,
                payload TEXT NOT NULL,
                published BOOLEAN NOT NULL DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        """);

        purchaseDao = new PurchaseDaoSqlite(jdbcTemplate);
        outboxDao = new OutboxDaoSqlite(jdbcTemplate);
    }

    @AfterEach
    void tearDown() {
        File file = new File(testDbPath);
        if (file.exists()) {
            file.delete();
        }
    }

    @Test
    void testSaveAndFindTransaction() {
        String txId = "tx-test-001";
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);
        Transaction tx = new Transaction(
                txId,
                "user-123",
                TransactionType.MIXED,
                BigDecimal.valueOf(175.50),
                "EUR",
                TransactionStatus.PENDING,
                expiresAt
        );

        purchaseDao.saveTransaction(tx);

        Optional<Transaction> found = purchaseDao.findById(txId);
        assertTrue(found.isPresent());
        assertEquals("user-123", found.get().getUserId());
        assertEquals(TransactionStatus.PENDING, found.get().getStatus());
        assertEquals(0, BigDecimal.valueOf(175.50).compareTo(found.get().getTotalAmount()));
    }

    @Test
    void testSaveAndFindItems() {
        String txId = "tx-test-002";
        Transaction tx = new Transaction(
                txId, "user-123", TransactionType.TICKET,
                BigDecimal.valueOf(125.00), "EUR", TransactionStatus.PENDING,
                LocalDateTime.now().plusMinutes(10)
        );
        purchaseDao.saveTransaction(tx);

        TransactionItem item = new TransactionItem(
                "item-001", txId, ItemType.TICKET, "fest_2026",
                TicketType.WEEKEND, 1, BigDecimal.valueOf(125.00), BigDecimal.valueOf(125.00)
        );
        purchaseDao.saveTransactionItems(List.of(item));

        List<TransactionItem> items = purchaseDao.findItemsByTransactionId(txId);
        assertEquals(1, items.size());
        assertEquals("fest_2026", items.get(0).getItemId());
        assertEquals(TicketType.WEEKEND, items.get(0).getTicketType());
    }

    @Test
    void testUpdatePaymentSuccess() {
        String txId = "tx-test-003";
        Transaction tx = new Transaction(
                txId, "user-123", TransactionType.TICKET,
                BigDecimal.valueOf(125.00), "EUR", TransactionStatus.PENDING,
                LocalDateTime.now().plusMinutes(10)
        );
        purchaseDao.saveTransaction(tx);

        purchaseDao.updatePaymentSuccess(txId, TransactionStatus.PAID, PaymentMethod.TARJETA, "tok_abc", "ch_xyz", "https://receipt");

        Optional<Transaction> updated = purchaseDao.findById(txId);
        assertTrue(updated.isPresent());
        assertEquals(TransactionStatus.PAID, updated.get().getStatus());
        assertEquals(PaymentMethod.TARJETA, updated.get().getPaymentMethod());
        assertEquals("ch_xyz", updated.get().getGatewayTransactionId());
    }

    @Test
    void testOutboxEventLifecycle() {
        OutboxEvent event = new OutboxEvent(
                "evt-001", "TRANSACTION", "tx-test-001", "ORDER_PAID", "{\"test\":true}", false
        );
        outboxDao.save(event);

        List<OutboxEvent> unpublished = outboxDao.findUnpublished(10);
        assertEquals(1, unpublished.size());
        assertEquals("evt-001", unpublished.get(0).getId());
        assertFalse(unpublished.get(0).isPublished());

        outboxDao.markAsPublished("evt-001");

        List<OutboxEvent> remaining = outboxDao.findUnpublished(10);
        assertTrue(remaining.isEmpty());
    }
}

