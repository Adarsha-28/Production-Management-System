package com.prodexa.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "production_plans")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ProductionPlan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;
    private String productName;
    private Integer targetQuantity;
    private Integer completedQuantity;

    @Enumerated(EnumType.STRING)
    private PlanStatus status;

    private LocalDate startDate;
    private LocalDate endDate;
    private String priority;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User assignedTo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User createdBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
