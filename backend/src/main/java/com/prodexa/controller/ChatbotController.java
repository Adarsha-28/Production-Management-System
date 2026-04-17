package com.prodexa.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/chatbot")
@RequiredArgsConstructor
public class ChatbotController {

    private static final Map<String, String> RESPONSES = new HashMap<>() {{
        put("production", "📊 Current production has 3 active plans. Plan #P-2024-001 is 78% complete and on track.");
        put("inventory", "📦 You have 4 materials with low stock. Steel Rods and Aluminum Sheets need immediate restocking.");
        put("machine", "⚙️ 8 machines are active, 2 are in maintenance. Machine CNC-003 is scheduled for maintenance tomorrow.");
        put("alert", "🔔 You have 3 unread alerts: 1 delay alert, 1 low stock warning, and 1 maintenance reminder.");
        put("report", "📈 This month's production efficiency is 87.3%, up 4.2% from last month.");
        put("help", "I can help you with: production status, inventory levels, machine monitoring, alerts, and reports. What would you like to know?");
        put("hello", "👋 Hello! I'm Prodexa Assistant. How can I help you today?");
        put("hi", "👋 Hi there! I'm here to help with your manufacturing operations. What do you need?");
        put("status", "✅ System Status: All services operational. 8/10 machines active. 3 production plans in progress.");
        put("efficiency", "📊 Overall plant efficiency today: 87.3%. Top performer: Assembly Line A at 94.2%.");
    }};

    @PostMapping("/message")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> body) {
        String message = body.getOrDefault("message", "").toLowerCase();
        String response = RESPONSES.entrySet().stream()
                .filter(e -> message.contains(e.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse("I'm not sure about that. Try asking about production, inventory, machines, alerts, or reports. Type 'help' for guidance.");

        return ResponseEntity.ok(Map.of("response", response, "timestamp", new Date().toString()));
    }
}
