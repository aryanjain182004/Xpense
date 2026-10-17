package org.bahikhata.xpense.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.bahikhata.xpense.entity.User;
import org.bahikhata.xpense.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
public class JwtAuthSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthSuccessHandler.class);

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @Value("${xpense.frontend-url:http://localhost:8081}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {
        OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
        User user = userService.upsertGoogleUser(
                oidcUser.getSubject(),
                oidcUser.getEmail(),
                oidcUser.getGivenName(),
                oidcUser.getFamilyName()
        );
        String token = jwtService.createToken(user.getUserId());
        log.info("Google OAuth login succeeded for userId={}", user.getUserId());
        String redirect = UriComponentsBuilder.fromUriString(frontendUrl)
                .path("/login")
                .queryParam("token", token)
                .build()
                .toUriString();
        response.sendRedirect(redirect);
    }
}
