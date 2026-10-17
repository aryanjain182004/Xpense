package org.bahikhata.xpense.dto;

import org.bahikhata.xpense.entity.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record TransactionResponse(
        Long transactionId,
        String description,
        BigDecimal amount,
        LocalDate transactionDate,
        Long categoryId,
        String categoryName,
        TransactionType type,
        Instant createdAt,
        Instant updatedAt
) {
}
