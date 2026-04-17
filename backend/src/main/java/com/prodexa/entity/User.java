package com.prodexa.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @JsonIgnore
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role;

    private String fullName;
    private String phone;
    private String department;
    private String avatarUrl;
    @Builder.Default
    private boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime lastLogin;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }
}
