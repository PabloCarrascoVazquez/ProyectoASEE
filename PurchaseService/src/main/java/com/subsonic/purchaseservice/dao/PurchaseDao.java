package com.subsonic.purchaseservice.dao;

import com.subsonic.purchaseservice.models.PaymentMethod;
import com.subsonic.purchaseservice.models.Transaction;
import com.subsonic.purchaseservice.models.TransactionItem;
import com.subsonic.purchaseservice.models.TransactionStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PurchaseDao {
    void saveTransaction(Transaction transaction);

    void saveTransactionItems(List<TransactionItem> items);

    Optional<Transaction> findById(String id);

    List<TransactionItem> findItemsByTransactionId(String transactionId);

    void updateStatus(String id, TransactionStatus status);

    void updatePaymentSuccess(String id, TransactionStatus status, PaymentMethod paymentMethod,
                                String gatewayToken, String gatewayTransactionId, String receiptUrl);

    List<Transaction> findExpiredPendingTransactions(LocalDateTime now);
}

