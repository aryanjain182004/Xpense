package org.bahikhata.xpense.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import org.bahikhata.xpense.dto.AuthResponse;
import org.bahikhata.xpense.entity.User;
import org.bahikhata.xpense.exception.UnauthorizedException;
import org.bahikhata.xpense.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;

@Service
public class GoogleAuthService {

    private static final Logger log = LoggerFactory.getLogger(GoogleAuthService.class);

    @Autowired
    private GoogleIdTokenVerifier googleIdTokenVerifier;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    public AuthResponse login(String idToken) {
        GoogleIdToken googleIdToken = verify(idToken);
        GoogleIdToken.Payload payload = googleIdToken.getPayload();
        User user = userService.upsertGoogleUser(
                payload.getSubject(),
                payload.getEmail(),
                (String) payload.get("given_name"),
                (String) payload.get("family_name")
        );
        log.info("Google ID token login succeeded for userId={}", user.getUserId());
        return new AuthResponse(jwtService.createToken(user.getUserId()), userService.toResponse(user));
    }

    private GoogleIdToken verify(String idToken) {
        try {
            GoogleIdToken googleIdToken = googleIdTokenVerifier.verify(idToken);
            if (googleIdToken == null) {
                log.warn("Google ID token verification returned null");
                throw new UnauthorizedException("Invalid Google token");
            }
            return googleIdToken;
        } catch (GeneralSecurityException | IOException | IllegalArgumentException ex) {
            log.warn("Google ID token verification failed: {}", ex.getMessage());
            throw new UnauthorizedException("Invalid Google token");
        }
    }
}
