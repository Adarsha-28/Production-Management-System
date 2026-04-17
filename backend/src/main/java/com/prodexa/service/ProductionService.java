package com.prodexa.service;

import com.prodexa.dto.DashboardStats;
import com.prodexa.entity.*;
import com.prodexa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductionService {

    private final ProductionPlanRepository planRepo;
    private final UserRepository userRepo;

    public Page<ProductionPlan> getAll(int page, int size, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        if (status != null && !status.isEmpty()) {
            return planRepo.findByStatus(PlanStatus.valueOf(status.toUpperCase()), pageable);
        }
        return planRepo.findAll(pageable);
    }

    public ProductionPlan getById(Long id) {
        return planRepo.findById(id).orElseThrow(() -> new RuntimeException("Plan not found"));
    }

    public ProductionPlan create(ProductionPlan plan, String creatorUsername) {
        User creator = userRepo.findByUsername(creatorUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        plan.setCreatedBy(creator);
        if (plan.getStatus() == null) plan.setStatus(PlanStatus.PLANNED);
        return planRepo.save(plan);
    }

    public ProductionPlan update(Long id, ProductionPlan updated) {
        ProductionPlan existing = getById(id);
        existing.setTitle(updated.getTitle());
        existing.setDescription(updated.getDescription());
        existing.setProductName(updated.getProductName());
        existing.setTargetQuantity(updated.getTargetQuantity());
        existing.setCompletedQuantity(updated.getCompletedQuantity());
        existing.setStatus(updated.getStatus());
        existing.setStartDate(updated.getStartDate());
        existing.setEndDate(updated.getEndDate());
        existing.setPriority(updated.getPriority());
        if (updated.getAssignedTo() != null)
            existing.setAssignedTo(updated.getAssignedTo());
        return planRepo.save(existing);
    }

    public void delete(Long id) { planRepo.deleteById(id); }

    public List<ProductionPlan> getByOperator(Long userId) {
        return planRepo.findByAssignedToId(userId);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", planRepo.count());
        stats.put("delayed", planRepo.countDelayed());
        List<Object[]> byStatus = planRepo.countByStatus();
        Map<String, Long> statusMap = new HashMap<>();
        for (Object[] row : byStatus) statusMap.put(row[0].toString(), (Long) row[1]);
        stats.put("byStatus", statusMap);
        return stats;
    }
}
