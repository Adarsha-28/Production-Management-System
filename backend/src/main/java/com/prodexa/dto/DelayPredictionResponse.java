package com.prodexa.dto;

import lombok.*;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DelayPredictionResponse {
    private String riskLevel;        // LOW, MEDIUM, HIGH
    private int riskScore;           // 0-100
    private String summary;
    private List<String> reasons;
    private List<String> suggestions;
}
