package com.prodexa.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String action;
    private String resource;
    private String details;
    private String ipAddress;
    private String status;
    private LocalDateTime timestamp;

    @PrePersist protected void onCreate() { timestamp = LocalDateTime.now(); }
}
