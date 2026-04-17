package com.prodexa.controller;

import com.prodexa.entity.Material;
import com.prodexa.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public ResponseEntity<Page<Material>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(inventoryService.getAll(page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Material> getById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Material> create(@RequestBody Material material) {
        return ResponseEntity.ok(inventoryService.save(material));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Material> update(@PathVariable Long id, @RequestBody Material material) {
        return ResponseEntity.ok(inventoryService.update(id, material));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inventoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<Material>> getLowStock() {
        return ResponseEntity.ok(inventoryService.getLowStock());
    }
}
