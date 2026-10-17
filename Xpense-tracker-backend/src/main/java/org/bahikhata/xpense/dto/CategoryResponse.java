package org.bahikhata.xpense.dto;

public record CategoryResponse(
        Long categoryId,
        String categoryName,
        boolean defaultCategory
) {
}
