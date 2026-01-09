package com.example.clerkdemo.filter;

import com.clerk.backend_api.helpers.security.AuthenticateRequest;
import com.clerk.backend_api.helpers.security.models.AuthenticateRequestOptions;
import com.clerk.backend_api.helpers.security.models.RequestState;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class ClerkAuthFilter extends OncePerRequestFilter {

    @Value("${clerk.secret-key}")
    private String clerkSecretKey;

    public static final String USER_ID_ATTRIBUTE = "clerkUserId";
    public static final String SESSION_ID_ATTRIBUTE = "clerkSessionId";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();

        if (path.startsWith("/api/public") || path.equals("/api/health")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!path.startsWith("/api/protected")) {
            filterChain.doFilter(request, response);
            return;
        }

        Map<String, List<String>> headers = new HashMap<>();
        Collections.list(request.getHeaderNames()).forEach(name ->
                headers.put(name, Collections.list(request.getHeaders(name)))
        );

        try {
            RequestState requestState = AuthenticateRequest.authenticateRequest(
                    headers,
                    AuthenticateRequestOptions.secretKey(clerkSecretKey).build()
            );

            if (requestState.isSignedIn()) {
                requestState.claims().ifPresent(claims -> {
                    request.setAttribute(USER_ID_ATTRIBUTE, claims.getSubject());
                    String sessionId = claims.get("sid", String.class);
                    request.setAttribute(SESSION_ID_ATTRIBUTE, sessionId != null ? sessionId : "unknown");
                });
                filterChain.doFilter(request, response);
            } else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                String reason = requestState.reason()
                        .map(Object::toString)
                        .orElse("Invalid or missing token");
                response.getWriter().write("{\"error\": \"Unauthorized\", \"reason\": \"" + reason + "\"}");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\": \"Authentication failed\", \"message\": \"" + e.getMessage() + "\"}");
        }
    }
}
