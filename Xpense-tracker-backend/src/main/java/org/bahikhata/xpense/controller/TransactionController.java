package org.bahikhata.xpense.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Digits;
import org.bahikhata.xpense.dto.TransactionRequest;
import org.bahikhata.xpense.dto.TransactionResponse;
import org.bahikhata.xpense.entity.TransactionType;
import org.bahikhata.xpense.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/transactions")
@Validated
@Tag(name = "Transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @GetMapping
    public List<TransactionResponse> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) @Digits(integer = 10, fraction = 2) BigDecimal minAmount,
            @RequestParam(required = false) @Digits(integer = 10, fraction = 2) BigDecimal maxAmount
    ) {
        return transactionService.getAll(fromDate, toDate, type, categoryId, minAmount, maxAmount);
    }

    @GetMapping("/{transactionId}")
    public TransactionResponse findById(@PathVariable Long transactionId) {
        return transactionService.toResponse(transactionService.findById(transactionId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse create(@Valid @RequestBody TransactionRequest request) {
        return transactionService.create(request);
    }

    @PutMapping("/{transactionId}")
    public TransactionResponse update(
            @PathVariable Long transactionId,
            @Valid @RequestBody TransactionRequest request
    ) {
        return transactionService.update(transactionId, request);
    }

    @DeleteMapping("/{transactionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long transactionId) {
        transactionService.delete(transactionId);
    }
}
