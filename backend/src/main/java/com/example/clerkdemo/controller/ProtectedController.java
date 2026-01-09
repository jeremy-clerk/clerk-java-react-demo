package com.example.clerkdemo.controller;

import com.example.clerkdemo.filter.ClerkAuthFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/protected")
public class ProtectedController {

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
}
