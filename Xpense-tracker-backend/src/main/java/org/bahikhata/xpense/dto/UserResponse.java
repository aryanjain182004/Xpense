package org.bahikhata.xpense.dto;

public record UserResponse(
        Long userId,
        String email,
        String firstName,
        String lastName
) {
}
