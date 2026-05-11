package com.prodexa.controller;

import com.prodexa.dto.DelayPredictionRequest;
import com.prodexa.dto.DelayPredictionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/predict")
@RequiredArgsConstructor
public class DelayPredictionController {

    @PostMapping("/delay")
    public ResponseEntity<DelayPredictionResponse> predictDelay(@RequestBody DelayPredictionRequest req) {

        int score = 0;
        List<String> reasons     = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        // ── Factor 1: Task completion progress ──
        double progress = req.getTargetQuantity() > 0
                ? (double) req.getCompletedQuantity() / req.getTargetQuantity() * 100
                : 0;

        if (progress < 25) {
            score += 35;
            reasons.add("Task completion is critically low (" + (int) progress + "%)");
            suggestions.add("Assign more operators and increase shift hours immediately.");
        } else if (progress < 50) {
            score += 20;
            reasons.add("Task completion is below halfway (" + (int) progress + "%)");
            suggestions.add("Review production schedule and reallocate resources.");
        } else if (progress < 75) {
            score += 10;
            reasons.add("Task completion is moderate (" + (int) progress + "%)");
            suggestions.add("Maintain current pace to meet the deadline.");
        }

        // ── Factor 2: Machine status ──
        String machineStatus = req.getMachineStatus() == null ? "ACTIVE" : req.getMachineStatus().toUpperCase();
        switch (machineStatus) {
            case "OFFLINE":
                score += 35;
                reasons.add("Primary machine is offline — production is halted.");
                suggestions.add("Escalate machine repair immediately or switch to a backup machine.");
                break;
            case "MAINTENANCE":
                score += 25;
                reasons.add("Machine is under maintenance — reduced capacity.");
                suggestions.add("Expedite maintenance and plan for overtime to recover lost time.");
                break;
            case "IDLE":
                score += 15;
                reasons.add("Machine is idle — not contributing to production.");
                suggestions.add("Investigate idle cause and restart machine operations.");
                break;
            default:
                // ACTIVE — no penalty
                break;
        }

        // ── Factor 3: Machine availability ratio ──
        if (req.getTotalMachines() > 0) {
            double machineRatio = (double) req.getActiveMachines() / req.getTotalMachines() * 100;
            if (machineRatio < 40) {
                score += 20;
                reasons.add("Only " + (int) machineRatio + "% of machines are active.");
                suggestions.add("Bring offline machines back online or redistribute workload.");
            } else if (machineRatio < 60) {
                score += 10;
                reasons.add("Machine availability is below optimal (" + (int) machineRatio + "%).");
                suggestions.add("Monitor machine health and prevent further downtime.");
            }
        }

        // ── Factor 4: Raw material availability ──
        double material = req.getMaterialAvailability();
        if (material < 20) {
            score += 30;
            reasons.add("Critical material shortage — only " + (int) material + "% available.");
            suggestions.add("Place emergency purchase orders and contact backup suppliers.");
        } else if (material < 50) {
            score += 18;
            reasons.add("Material availability is low (" + (int) material + "%).");
            suggestions.add("Initiate restocking process and monitor consumption rate.");
        } else if (material < 70) {
            score += 8;
            reasons.add("Material stock is moderate (" + (int) material + "%).");
            suggestions.add("Schedule a restock before levels drop further.");
        }

        // ── Cap score at 100 ──
        score = Math.min(score, 100);

        // ── Determine risk level ──
        String riskLevel;
        String summary;
        if (score >= 60) {
            riskLevel = "HIGH";
            summary   = "High probability of production delay. Immediate action required.";
            if (suggestions.isEmpty()) suggestions.add("Conduct an emergency review meeting with all stakeholders.");
        } else if (score >= 30) {
            riskLevel = "MEDIUM";
            summary   = "Moderate delay risk detected. Proactive measures recommended.";
            if (suggestions.isEmpty()) suggestions.add("Monitor progress closely and prepare contingency plans.");
        } else {
            riskLevel = "LOW";
            summary   = "Production is on track. Low risk of delay.";
            if (reasons.isEmpty()) reasons.add("All production factors are within acceptable range.");
            if (suggestions.isEmpty()) suggestions.add("Continue current operations and maintain quality standards.");
        }

        return ResponseEntity.ok(DelayPredictionResponse.builder()
                .riskLevel(riskLevel)
                .riskScore(score)
                .summary(summary)
                .reasons(reasons)
                .suggestions(suggestions)
                .build());
    }
}
