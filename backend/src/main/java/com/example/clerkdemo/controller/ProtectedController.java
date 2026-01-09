package com.example.clerkdemo.controller;

import com.clerk.backend_api.Clerk;
import com.clerk.backend_api.models.operations.CreateSessionTokenRequestBody;
import com.clerk.backend_api.models.operations.CreateSessionTokenResponse;
import com.example.clerkdemo.filter.ClerkAuthFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/protected")
public class ProtectedController {

    private static final long ONE_MONTH_IN_SECONDS = 30L * 24 * 60 * 60;

    @Value("${clerk.secret-key}")
    private String clerkSecretKey;

    @GetMapping("/user")
    public Map<String, Object> getUserInfo(HttpServletRequest request) {
        String userId = (String) request.getAttribute(ClerkAuthFilter.USER_ID_ATTRIBUTE);
        String sessionId = (String) request.getAttribute(ClerkAuthFilter.SESSION_ID_ATTRIBUTE);

        return Map.of(
                "message", "You are authenticated!",
                "userId", userId != null ? userId : "unknown",
                "sessionId", sessionId != null ? sessionId : "unknown"
        );
    }

    @GetMapping("/data")
    public Map<String, Object> getProtectedData(HttpServletRequest request) {
        String userId = (String) request.getAttribute(ClerkAuthFilter.USER_ID_ATTRIBUTE);

        return Map.of(
                "userId", userId != null ? userId : "unknown",
                "secretData", "This is protected data only visible to authenticated users",
                "items", new String[]{"Item 1", "Item 2", "Item 3"}
        );
    }

    @PostMapping("/generate-long-lived-token")
    public Map<String, Object> generateLongLivedToken(HttpServletRequest request) {
        String userId = (String) request.getAttribute(ClerkAuthFilter.USER_ID_ATTRIBUTE);
        String sessionId = (String) request.getAttribute(ClerkAuthFilter.SESSION_ID_ATTRIBUTE);

        if (sessionId == null || "unknown".equals(sessionId)) {
            return Map.of("error", "Session ID not found");
        }

        try {
            Clerk sdk = Clerk.builder()
                    .bearerAuth(clerkSecretKey)
                    .build();

            CreateSessionTokenRequestBody body = CreateSessionTokenRequestBody.builder()
                    .expiresInSeconds(ONE_MONTH_IN_SECONDS)
                    .build();

            CreateSessionTokenResponse response = sdk.sessions().createToken()
                    .sessionId(sessionId)
                    .requestBody(body)
                    .call();

            if (response.object().isPresent()) {
                var tokenObj = response.object().get();
                return Map.of(
                        "jwt", tokenObj.jwt(),
                        "userId", userId != null ? userId : "unknown",
                        "sessionId", sessionId,
                        "expiresInSeconds", ONE_MONTH_IN_SECONDS
                );
            }

            return Map.of("error", "Failed to generate token");
        } catch (Exception e) {
            return Map.of("error", "Failed to generate token: " + e.getMessage());
        }
    }
}
