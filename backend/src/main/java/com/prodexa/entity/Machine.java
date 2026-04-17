package com.prodexa.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "machines")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Machine {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String machineCode;
    private String type;
    private String location;

    @Enumerated(EnumType.STRING)
    private MachineStatus status;

    private Double efficiency;
    private Integer totalDowntimeMinutes;
    private LocalDateTime lastMaintenance;
    private LocalDateTime nextMaintenance;
    private String operatorName;
    private String notes;
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
}
