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
        // Only penalise if completed is genuinely low relative to target.
        // We use a proportional penalty so large targets (1000) are treated
        // the same as small targets (100) — it's the % that matters, not the raw number.
        int target    = Math.max(req.getTargetQuantity(), 1);
        int completed = Math.max(req.getCompletedQuantity(), 0);
        double progress = Math.min(100.0, (double) completed / target * 100);

        // Penalty is proportional: max 30 pts, scaled by how far below 100% we are.
        // A plan at 0% gets 30 pts; at 50% gets 15 pts; at 80% gets 6 pts; at 100% gets 0.
        int progressPenalty = (int) Math.round((1.0 - progress / 100.0) * 30);
        score += progressPenalty;

        if (progress < 20) {
            reasons.add("Task completion is very low (" + (int) progress + "% of " + target + " units).");
            suggestions.add("Increase workforce or extend shift hours to accelerate production.");
        } else if (progress < 50) {
            reasons.add("Task completion is below halfway (" + (int) progress + "%).");
            suggestions.add("Review the production schedule and reallocate resources if needed.");
        } else if (progress < 80) {
            reasons.add("Task is progressing moderately (" + (int) progress + "%).");
            suggestions.add("Maintain current pace — monitor daily to stay on track.");
        }
        // 80–100%: no reason added, no penalty impact is minimal

        // ── Factor 2: Machine status (max 30 pts) ──
        String machineStatus = req.getMachineStatus() == null ? "ACTIVE" : req.getMachineStatus().toUpperCase();
        switch (machineStatus) {
            case "OFFLINE":
                score += 30;
                reasons.add("Primary machine is offline — production is halted.");
                suggestions.add("Escalate machine repair immediately or switch to a backup machine.");
                break;
            case "MAINTENANCE":
                score += 20;
                reasons.add("Machine is under maintenance — reduced production capacity.");
                suggestions.add("Expedite maintenance and plan overtime to recover lost time.");
                break;
            case "IDLE":
                score += 10;
                reasons.add("Machine is idle — not contributing to production.");
                suggestions.add("Investigate the idle cause and restart machine operations.");
                break;
            default:
                // ACTIVE — no penalty
                break;
        }

        // ── Factor 3: Machine availability ratio (max 20 pts) ──
        if (req.getTotalMachines() > 0) {
            double machineRatio = (double) req.getActiveMachines() / req.getTotalMachines() * 100;
            if (machineRatio < 40) {
                score += 20;
                reasons.add("Only " + (int) machineRatio + "% of machines are currently active.");
                suggestions.add("Bring offline machines back online or redistribute the workload.");
            } else if (machineRatio < 60) {
                score += 10;
                reasons.add("Machine availability is below optimal (" + (int) machineRatio + "%).");
                suggestions.add("Monitor machine health and prevent further downtime.");
            } else if (machineRatio < 80) {
                score += 5;
                // Minor note — no reason added to keep output clean
            }
        }

        // ── Factor 4: Raw material availability (max 20 pts) ──
        double material = req.getMaterialAvailability();
        if (material < 20) {
            score += 20;
            reasons.add("Critical material shortage — only " + (int) material + "% available.");
            suggestions.add("Place emergency purchase orders and contact backup suppliers.");
        } else if (material < 40) {
            score += 12;
            reasons.add("Material availability is low (" + (int) material + "%).");
            suggestions.add("Initiate restocking immediately to avoid production stoppage.");
        } else if (material < 60) {
            score += 6;
            reasons.add("Material stock is moderate (" + (int) material + "%).");
            suggestions.add("Schedule a restock before levels drop further.");
        }
        // 60–100%: adequate — no penalty

        // ── Cap score at 100 ──
        score = Math.min(score, 100);

        // ── Determine risk level ──
        // Thresholds: LOW < 30, MEDIUM 30–59, HIGH >= 60
        String riskLevel;
        String summary;
        if (score >= 60) {
            riskLevel = "HIGH";
            summary   = "High probability of production delay. Immediate action required.";
            if (suggestions.isEmpty())
                suggestions.add("Conduct an emergency review meeting with all stakeholders.");
        } else if (score >= 30) {
            riskLevel = "MEDIUM";
            summary   = "Moderate delay risk detected. Proactive measures recommended.";
            if (suggestions.isEmpty())
                suggestions.add("Monitor progress closely and prepare contingency plans.");
        } else {
            riskLevel = "LOW";
            summary   = "Production is on track. Low risk of delay.";
            if (reasons.isEmpty())
                reasons.add("All production factors are within acceptable range.");
            if (suggestions.isEmpty())
                suggestions.add("Continue current operations and maintain quality standards.");
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
