package com.subsonic.purchaseservice.dao.mysql;

import com.subsonic.purchaseservice.dao.PurchaseDao;
import com.subsonic.purchaseservice.models.*;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public class PurchaseDaoMySql implements PurchaseDao {
    private final JdbcTemplate jdbcTemplate;

    public PurchaseDaoMySql(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Transaction> transactionRowMapper = new RowMapper<>() {
        @Override
        public Transaction mapRow(ResultSet rs, int rowNum) throws SQLException {
            Transaction tx = new Transaction();
            tx.setId(rs.getString("id"));
            tx.setUserId(rs.getString("user_id"));
            tx.setType(TransactionType.fromString(rs.getString("type")));
            tx.setTotalAmount(rs.getBigDecimal("total_amount"));
            tx.setCurrency(rs.getString("currency"));
            tx.setStatus(TransactionStatus.valueOf(rs.getString("status")));

            Timestamp expiresAt = rs.getTimestamp("reservation_expires_at");
            if (expiresAt != null) {
                tx.setReservationExpiresAt(expiresAt.toLocalDateTime());
            }

            String paymentMethod = rs.getString("payment_method");
            if (paymentMethod != null) {
                tx.setPaymentMethod(PaymentMethod.fromString(paymentMethod));
            }

            tx.setGatewayToken(rs.getString("gateway_token"));
            tx.setGatewayTransactionId(rs.getString("gateway_transaction_id"));
            tx.setReceiptUrl(rs.getString("receipt_url"));

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                tx.setCreatedAt(createdAt.toLocalDateTime());
            }

            Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                tx.setUpdatedAt(updatedAt.toLocalDateTime());
            }

            return tx;
        }
    };

    private final RowMapper<TransactionItem> itemRowMapper = new RowMapper<>() {
        @Override
        public TransactionItem mapRow(ResultSet rs, int rowNum) throws SQLException {
            TransactionItem item = new TransactionItem();
            item.setId(rs.getString("id"));
            item.setTransactionId(rs.getString("transaction_id"));
            item.setItemType(ItemType.fromString(rs.getString("item_type")));
            item.setItemId(rs.getString("item_id"));

            String ticketType = rs.getString("ticket_type");
            if (ticketType != null) {
                item.setTicketType(TicketType.fromString(ticketType));
            }

            item.setQuantity(rs.getInt("quantity"));
            item.setUnitPrice(rs.getBigDecimal("unit_price"));
            item.setSubtotal(rs.getBigDecimal("subtotal"));

            return item;
        }
    };

    @Override
    public void saveTransaction(Transaction tx) {
        String sql = """
            INSERT INTO transactions (id, user_id, type, total_amount, currency, status,
                                     reservation_expires_at, payment_method, gateway_token,
                                     gateway_transaction_id, receipt_url, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
        jdbcTemplate.update(sql,
                tx.getId(),
                tx.getUserId(),
                tx.getType() != null ? tx.getType().getValue() : "ticket",
                tx.getTotalAmount(),
                tx.getCurrency(),
                tx.getStatus().name(),
                tx.getReservationExpiresAt() != null ? Timestamp.valueOf(tx.getReservationExpiresAt()) : null,
                tx.getPaymentMethod() != null ? tx.getPaymentMethod().getValue() : null,
                tx.getGatewayToken(),
                tx.getGatewayTransactionId(),
                tx.getReceiptUrl(),
                tx.getCreatedAt() != null ? Timestamp.valueOf(tx.getCreatedAt()) : Timestamp.valueOf(LocalDateTime.now()),
                tx.getUpdatedAt() != null ? Timestamp.valueOf(tx.getUpdatedAt()) : Timestamp.valueOf(LocalDateTime.now())
        );
    }

    @Override
    public void saveTransactionItems(List<TransactionItem> items) {
        if (items == null || items.isEmpty()) return;

        String sql = """
            INSERT INTO transaction_items (id, transaction_id, item_type, item_id, ticket_type, quantity, unit_price, subtotal)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """;

        jdbcTemplate.batchUpdate(sql, items, items.size(), (ps, item) -> {
            ps.setString(1, item.getId());
            ps.setString(2, item.getTransactionId());
            ps.setString(3, item.getItemType() != null ? item.getItemType().getValue() : "ticket");
            ps.setString(4, item.getItemId());
            ps.setString(5, item.getTicketType() != null ? item.getTicketType().getValue() : null);
            ps.setInt(6, item.getQuantity());
            ps.setBigDecimal(7, item.getUnitPrice());
            ps.setBigDecimal(8, item.getSubtotal());
        });
    }

    @Override
    public Optional<Transaction> findById(String id) {
        String sql = "SELECT * FROM transactions WHERE id = ?";
        try {
            Transaction tx = jdbcTemplate.queryForObject(sql, transactionRowMapper, id);
            return Optional.ofNullable(tx);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    @Override
    public List<TransactionItem> findItemsByTransactionId(String transactionId) {
        String sql = "SELECT * FROM transaction_items WHERE transaction_id = ?";
        return jdbcTemplate.query(sql, itemRowMapper, transactionId);
    }

    @Override
    public void updateStatus(String id, TransactionStatus status) {
        String sql = "UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?";
        jdbcTemplate.update(sql, status.name(), id);
    }

    @Override
    public void updatePaymentSuccess(String id, TransactionStatus status, PaymentMethod paymentMethod,
                                    String gatewayToken, String gatewayTransactionId, String receiptUrl) {
        String sql = """
            UPDATE transactions 
            SET status = ?, payment_method = ?, gateway_token = ?, 
                gateway_transaction_id = ?, receipt_url = ?, updated_at = NOW()
            WHERE id = ?
        """;
        jdbcTemplate.update(sql,
                status.name(),
                paymentMethod != null ? paymentMethod.getValue() : null,
                gatewayToken,
                gatewayTransactionId,
                receiptUrl,
                id
        );
    }

    @Override
    public List<Transaction> findExpiredPendingTransactions(LocalDateTime now) {
        String sql = "SELECT * FROM transactions WHERE status = 'PENDING' AND reservation_expires_at < ?";
        return jdbcTemplate.query(sql, transactionRowMapper, Timestamp.valueOf(now));
    }
}

