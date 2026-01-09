package com.example.clerkdemo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class PublicController {

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
}
