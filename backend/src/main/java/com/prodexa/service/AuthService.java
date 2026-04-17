package com.prodexa.service;

import com.prodexa.dto.*;
import com.prodexa.entity.*;
import com.prodexa.repository.*;
import com.prodexa.security.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;
    private final AuthenticationManager authenticationManager;
    private final AuditLogRepository auditLogRepository;

    public AuthResponse register(RegisterRequest req) {
        // Manual validation with clear messages
        if (req.getUsername() == null || req.getUsername().isBlank())
            throw new RuntimeException("Username is required");
        if (req.getEmail() == null || req.getEmail().isBlank())
            throw new RuntimeException("Email is required");
        if (req.getPassword() == null || req.getPassword().length() < 6)
            throw new RuntimeException("Password must be at least 6 characters");
        if (req.getFullName() == null || req.getFullName().isBlank())
            throw new RuntimeException("Full name is required");

        if (userRepository.existsByUsername(req.getUsername().trim()))
            throw new RuntimeException("Username '" + req.getUsername() + "' already exists");
        if (userRepository.existsByEmail(req.getEmail().trim()))
            throw new RuntimeException("Email '" + req.getEmail() + "' already exists");

        User user = User.builder()
                .username(req.getUsername().trim())
                .email(req.getEmail().trim())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName().trim())
                .role(req.getRole() != null ? req.getRole() : Role.MACHINE_OPERATOR)
                .phone(req.getPhone())
                .department(req.getDepartment())
                .active(true)
                .build();

        userRepository.save(user);
        log.info("New user registered: {} with role: {}", user.getUsername(), user.getRole());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtil.generateToken(userDetails);

        return buildResponse(user, token);
    }

    public AuthResponse login(LoginRequest req) {
        if (req.getUsername() == null || req.getUsername().isBlank())
            throw new RuntimeException("Username is required");
        if (req.getPassword() == null || req.getPassword().isBlank())
            throw new RuntimeException("Password is required");

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));

        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
                .username(user.getUsername())
                .action("LOGIN")
                .resource("AUTH")
                .details("User logged in successfully")
                .status("SUCCESS")
                .build());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        String token = jwtUtil.generateToken(userDetails);
        log.info("User logged in: {}", user.getUsername());

        return buildResponse(user, token);
    }

    private AuthResponse buildResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .userId(user.getId())
                .avatarUrl(user.getAvatarUrl())
                .lastLogin(user.getLastLogin())
                .build();
    }
}
