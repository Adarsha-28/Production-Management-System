package com.prodexa.controller;

import com.prodexa.entity.ProductionPlan;
import com.prodexa.service.ProductionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/production")
@RequiredArgsConstructor
public class ProductionController {

    private final ProductionService productionService;

    @GetMapping
    public ResponseEntity<Page<ProductionPlan>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(productionService.getAll(page, size, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductionPlan> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productionService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ProductionPlan> create(@RequestBody ProductionPlan plan,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(productionService.create(plan, userDetails.getUsername()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductionPlan> update(@PathVariable Long id, @RequestBody ProductionPlan plan) {
        return ResponseEntity.ok(productionService.update(id, plan));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(productionService.getStats());
    }

    @GetMapping("/operator/{userId}")
    public ResponseEntity<?> getByOperator(@PathVariable Long userId) {
        return ResponseEntity.ok(productionService.getByOperator(userId));
    }
}
