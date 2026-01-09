package com.example.clerkdemo.controller;

import com.clerk.backend_api.helpers.security.VerifyToken;
import com.clerk.backend_api.helpers.security.models.TokenVerificationResponse;
import com.clerk.backend_api.helpers.security.models.VerifyTokenOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class PublicController {

    @Value("${clerk.secret-key}")
    private String clerkSecretKey;

    @GetMapping("/health")
    public Map<String, Object> health() {
        return Map.of(
                "status", "healthy",
                "timestamp", System.currentTimeMillis()
        );
    }

    @GetMapping("/public/info")
    public Map<String, Object> publicInfo() {
        return Map.of(
                "message", "This is a public endpoint - no authentication required",
                "app", "Clerk Java + React Demo"
        );
    }

    @PostMapping("/public/verify-token")
    public ResponseEntity<?> verifyToken(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token is required"));
        }

        try {
            VerifyTokenOptions options = VerifyTokenOptions
                    .secretKey(clerkSecretKey)
                    .build();

            TokenVerificationResponse<?> response = VerifyToken.verifyToken(token, options);
            return ResponseEntity.ok(Map.of(
                    "verified", true,
                    "payload", response.payload()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "verified", false,
                    "error", e.getMessage()
            ));
        }
    }
}
