package org.bahikhata.xpense.repository;

import org.bahikhata.xpense.entity.Category;
import org.bahikhata.xpense.entity.Transaction;
import org.bahikhata.xpense.entity.TransactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("""
            SELECT t FROM Transaction t
            JOIN FETCH t.category
            WHERE t.user.userId = :userId
              AND (:fromDate IS NULL OR t.transactionDate >= :fromDate)
              AND (:toDate IS NULL OR t.transactionDate <= :toDate)
              AND (:type IS NULL OR t.type = :type)
              AND (:categoryId IS NULL OR t.category.categoryId = :categoryId)
              AND (:minAmount IS NULL OR t.amount >= :minAmount)
              AND (:maxAmount IS NULL OR t.amount <= :maxAmount)
            ORDER BY t.transactionDate DESC, t.transactionId DESC
            """)
    List<Transaction> search(
            @Param("userId") Long userId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate,
            @Param("type") TransactionType type,
            @Param("categoryId") Long categoryId,
            @Param("minAmount") BigDecimal minAmount,
            @Param("maxAmount") BigDecimal maxAmount
    );

    @Query("""
            SELECT t FROM Transaction t
            JOIN FETCH t.category
            WHERE t.transactionId = :transactionId
              AND t.user.userId = :userId
            """)
    Optional<Transaction> findByTransactionIdAndUser_UserId(
            @Param("transactionId") Long transactionId,
            @Param("userId") Long userId
    );

    @Modifying
    @Query("""
            UPDATE Transaction t
            SET t.category = :toCategory, t.updatedAt = :now
            WHERE t.user.userId = :userId
              AND t.category.categoryId = :fromCategoryId
            """)
    int reassignTransactions(
            @Param("userId") Long userId,
            @Param("fromCategoryId") Long fromCategoryId,
            @Param("toCategory") Category toCategory,
            @Param("now") Instant now
    );
}
