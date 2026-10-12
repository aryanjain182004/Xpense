package org.bahikhata.xpense.service;

import org.bahikhata.xpense.dto.UserResponse;
import org.bahikhata.xpense.entity.User;
import org.bahikhata.xpense.exception.ResourceNotFoundException;
import org.bahikhata.xpense.repository.UserRepository;
import org.bahikhata.xpense.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Transactional
    public User upsertGoogleUser(String googleId, String email, String firstName, String lastName) {
        Instant now = Instant.now();
        String safeFirstName = blankToDefault(firstName, "User");
        String safeLastName = blankToDefault(lastName, "-");
        String safeEmail = blankToDefault(email, googleId + "@users.noreply.google.com");

        return userRepository.findByGoogleId(googleId)
                .map(existing -> {
                    existing.setEmail(safeEmail);
                    existing.setFirstName(safeFirstName);
                    existing.setLastName(safeLastName);
                    existing.setLastLogin(now);
                    log.info("Updated Google user userId={}", existing.getUserId());
                    return existing;
                })
                .orElseGet(() -> {
                    User user = new User();
                    user.setGoogleId(googleId);
                    user.setEmail(safeEmail);
                    user.setFirstName(safeFirstName);
                    user.setLastName(safeLastName);
                    user.setCreatedAt(now);
                    user.setLastLogin(now);
                    User saved = userRepository.save(user);
                    log.info("Created Google user userId={}", saved.getUserId());
                    return saved;
                });
    }

    @Transactional(readOnly = true)
    public UserResponse getUser() {
        return toResponse(findById(jwtService.getCurrentUserId()));
    }

    @Transactional(readOnly = true)
    public User findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName()
        );
    }

    private static String blankToDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
