package com.prodexa.dto;

import lombok.*;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardStats {
    private long totalPlans;
    private long activePlans;
    private long delayedPlans;
    private long completedPlans;
    private long totalMaterials;
    private long lowStockAlerts;
    private long totalMachines;
    private long activeMachines;
    private long maintenanceMachines;
    private long unreadNotifications;
    private Map<String, Long> plansByStatus;
    private Map<String, Long> machinesByStatus;
}
