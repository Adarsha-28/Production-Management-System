package com.prodexa.repository;

import com.prodexa.entity.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductionPlanRepository extends JpaRepository<ProductionPlan, Long> {
    Page<ProductionPlan> findByStatus(PlanStatus status, Pageable pageable);
    List<ProductionPlan> findByAssignedToId(Long userId);

    @Query("SELECT p.status, COUNT(p) FROM ProductionPlan p GROUP BY p.status")
    List<Object[]> countByStatus();

    @Query("SELECT COUNT(p) FROM ProductionPlan p WHERE p.status = 'DELAYED'")
    long countDelayed();
}
