package com.prodexa.dto;

import lombok.Data;

@Data
public class DelayPredictionRequest {
    private int targetQuantity;
    private int completedQuantity;
    private String machineStatus;       // ACTIVE, IDLE, MAINTENANCE, OFFLINE
    private double materialAvailability; // 0-100 percent
    private int activeMachines;
    private int totalMachines;
}
