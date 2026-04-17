package com.prodexa.controller;

import com.prodexa.entity.Machine;
import com.prodexa.service.MachineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/machines")
@RequiredArgsConstructor
public class MachineController {

    private final MachineService machineService;

    @GetMapping
    public ResponseEntity<List<Machine>> getAll() {
        return ResponseEntity.ok(machineService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Machine> getById(@PathVariable Long id) {
        return ResponseEntity.ok(machineService.getById(id));
    }

    @PostMapping
    public ResponseEntity<Machine> create(@RequestBody Machine machine) {
        return ResponseEntity.ok(machineService.save(machine));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Machine> update(@PathVariable Long id, @RequestBody Machine machine) {
        return ResponseEntity.ok(machineService.update(id, machine));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        machineService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(machineService.getStatusStats());
    }
}
