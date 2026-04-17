package com.prodexa.dto;

import com.prodexa.entity.Role;
import lombok.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String email;
    private String fullName;
    private Role role;
    private Long userId;
    private String avatarUrl;
    private LocalDateTime lastLogin;
}
