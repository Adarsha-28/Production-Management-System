package com.prodexa.service;

import com.prodexa.dto.DashboardStats;
import com.prodexa.entity.*;
import com.prodexa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductionPlanRepository planRepo;
    private final MaterialRepository materialRepo;
    private final MachineRepository machineRepo;
    private final NotificationRepository notifRepo;
    private final UserRepository userRepo;

    public DashboardStats getStats(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();

        Map<String, Long> plansByStatus = new HashMap<>();
        for (Object[] row : planRepo.countByStatus())
            plansByStatus.put(row[0].toString(), (Long) row[1]);

        Map<String, Long> machinesByStatus = new HashMap<>();
        for (Object[] row : machineRepo.countByStatus())
            machinesByStatus.put(row[0].toString(), (Long) row[1]);

        return DashboardStats.builder()
                .totalPlans(planRepo.count())
                .activePlans(plansByStatus.getOrDefault("IN_PROGRESS", 0L))
                .delayedPlans(plansByStatus.getOrDefault("DELAYED", 0L))
                .completedPlans(plansByStatus.getOrDefault("COMPLETED", 0L))
                .totalMaterials(materialRepo.count())
                .lowStockAlerts(materialRepo.countLowStock())
                .totalMachines(machineRepo.count())
                .activeMachines(machinesByStatus.getOrDefault("ACTIVE", 0L))
                .maintenanceMachines(machinesByStatus.getOrDefault("MAINTENANCE", 0L))
                .unreadNotifications(notifRepo.countByUserIdAndReadFalse(user.getId()))
                .plansByStatus(plansByStatus)
                .machinesByStatus(machinesByStatus)
                .build();
    }
}
