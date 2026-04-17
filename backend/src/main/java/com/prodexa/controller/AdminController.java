package com.prodexa.controller;

import com.prodexa.dto.RegisterRequest;
import com.prodexa.entity.*;
import com.prodexa.repository.AuditLogRepository;
import com.prodexa.service.AuthService;
import com.prodexa.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserService userService;
    private final AuditLogRepository auditLogRepo;
    private final AuthService authService;

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody RegisterRequest req) {
        try {
            return ResponseEntity.ok(authService.register(req));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/users")
    public ResponseEntity<Page<User>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return ResponseEntity.ok(userService.getAll(page, size));
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<User> updateRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(userService.updateRole(id, Role.valueOf(body.get("role"))));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/logs")
    public ResponseEntity<Page<AuditLog>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(auditLogRepo.findAllByOrderByTimestampDesc(PageRequest.of(page, size)));
    }
}
