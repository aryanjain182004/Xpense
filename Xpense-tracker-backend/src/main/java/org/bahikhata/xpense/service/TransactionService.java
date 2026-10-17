package org.bahikhata.xpense.service;

import org.bahikhata.xpense.dto.TransactionRequest;
import org.bahikhata.xpense.dto.TransactionResponse;
import org.bahikhata.xpense.entity.Category;
import org.bahikhata.xpense.entity.Transaction;
import org.bahikhata.xpense.entity.TransactionType;
import org.bahikhata.xpense.entity.User;
import org.bahikhata.xpense.exception.ResourceNotFoundException;
import org.bahikhata.xpense.repository.TransactionRepository;
import org.bahikhata.xpense.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    private static final Logger log = LoggerFactory.getLogger(TransactionService.class);

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private JwtService jwtService;

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAll(
            LocalDate fromDate,
            LocalDate toDate,
            TransactionType type,
            Long categoryId,
            BigDecimal minAmount,
            BigDecimal maxAmount
    ) {
        return transactionRepository.search(
                        jwtService.getCurrentUserId(),
                        fromDate,
                        toDate,
                        type,
                        categoryId,
                        minAmount,
                        maxAmount
                ).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Transaction findById(Long transactionId) {
        return transactionRepository.findByTransactionIdAndUser_UserId(transactionId, jwtService.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found: " + transactionId));
    }

    @Transactional
    public TransactionResponse create(TransactionRequest request) {
        Long userId = jwtService.getCurrentUserId();
        Category category = categoryService.findById(request.categoryId());
        Transaction transaction = new Transaction();
        apply(transaction, userId, category, request);
        Transaction saved = transactionRepository.save(transaction);
        log.info("Created transaction id={} for userId={}", saved.getTransactionId(), userId);
        return toResponse(saved);
    }

    @Transactional
    public TransactionResponse update(Long transactionId, TransactionRequest request) {
        Long userId = jwtService.getCurrentUserId();
        Transaction transaction = findById(transactionId);
        Category category = categoryService.findById(request.categoryId());
        apply(transaction, userId, category, request);
        log.info("Updated transaction id={} for userId={}", transactionId, userId);
        return toResponse(transaction);
    }

    @Transactional
    public void delete(Long transactionId) {
        Transaction transaction = findById(transactionId);
        transactionRepository.delete(transaction);
        log.info("Deleted transaction id={} for userId={}", transactionId, jwtService.getCurrentUserId());
    }

    private void apply(Transaction transaction, Long userId, Category category, TransactionRequest request) {
        User user = new User();
        user.setUserId(userId);
        transaction.setDescription(request.description().trim());
        transaction.setAmount(request.amount());
        transaction.setTransactionDate(request.transactionDate());
        transaction.setCategory(category);
        transaction.setUser(user);
        transaction.setType(request.type());
    }

    public TransactionResponse toResponse(Transaction transaction) {
        return new TransactionResponse(
                transaction.getTransactionId(),
                transaction.getDescription(),
                transaction.getAmount(),
                transaction.getTransactionDate(),
                transaction.getCategory().getCategoryId(),
                transaction.getCategory().getCategoryName(),
                transaction.getType(),
                transaction.getCreatedAt(),
                transaction.getUpdatedAt()
        );
    }
}
