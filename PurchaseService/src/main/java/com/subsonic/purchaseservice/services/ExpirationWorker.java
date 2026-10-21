package com.subsonic.purchaseservice.services;

import com.subsonic.purchaseservice.dao.PurchaseDao;
import com.subsonic.purchaseservice.models.Transaction;
import com.subsonic.purchaseservice.models.TransactionStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ExpirationWorker {
    private static final Logger log = LoggerFactory.getLogger(ExpirationWorker.class);

    private final PurchaseDao purchaseDao;
    private final PurchaseOrchestratorService orchestratorService;

    public ExpirationWorker(PurchaseDao purchaseDao, PurchaseOrchestratorService orchestratorService) {
        this.purchaseDao = purchaseDao;
        this.orchestratorService = orchestratorService;
    }

    /**
     * Limpieza y Compensación de Expiraciones: Busca transacciones en estado PENDING
     * cuyo tiempo reservation_expires_at haya vencido (más de 10 minutos), actualiza su estado
     * a EXPIRED y llama a los endpoints /liberar de Catálogo e Inventario para devolver cupos y existencias.
     */
    @Scheduled(fixedDelayString = "${expiration.worker.interval:60000}", initialDelay = 15000)
    public void cleanupExpiredReservations() {
        LocalDateTime now = LocalDateTime.now();
        List<Transaction> expiredList = purchaseDao.findExpiredPendingTransactions(now);

        if (expiredList.isEmpty()) {
            return;
        }

        log.info("Worker de expiración: Detectadas {} transacciones PENDING vencidas. Procediendo a compensar...", expiredList.size());

        for (Transaction tx : expiredList) {
            try {
                log.info("Expirando transacción {} (Límite vencido: {}). Liberando cupos y existencias...",
                        tx.getId(), tx.getReservationExpiresAt());

                // Actualizar estado a EXPIRED
                purchaseDao.updateStatus(tx.getId(), TransactionStatus.EXPIRED);

                // Llamar a los endpoints /liberar de Catálogo e Inventario
                orchestratorService.liberarRecursosDeTransaccion(tx.getId(), null);

                log.info("Transacción {} marcada como EXPIRED y recursos liberados satisfactoriamente", tx.getId());
            } catch (Exception e) {
                log.error("Error al compensar expiración para transacción {}: {}", tx.getId(), e.getMessage(), e);
            }
        }
    }
}

