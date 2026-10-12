package org.bahikhata.xpense.dto;

public record AuthResponse(
        String token,
        UserResponse user
) {
}
