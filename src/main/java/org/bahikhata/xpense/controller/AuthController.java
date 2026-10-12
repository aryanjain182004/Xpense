package org.bahikhata.xpense.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.bahikhata.xpense.dto.AuthResponse;
import org.bahikhata.xpense.dto.GoogleAuthRequest;
import org.bahikhata.xpense.service.GoogleAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;

import java.io.IOException;

@RestController
@RequestMapping("/auth")
@Tag(name = "Auth")
@SecurityRequirements
public class AuthController {

    @Autowired
    private GoogleAuthService googleAuthService;

    @PostMapping("/google")
    public AuthResponse google(@Valid @RequestBody GoogleAuthRequest request) {
        return googleAuthService.login(request.idToken());
    }

    @GetMapping("/google")
    public void googleBrowser(HttpServletResponse response) throws IOException {
        response.sendRedirect("/oauth2/authorization/google");
    }
}
