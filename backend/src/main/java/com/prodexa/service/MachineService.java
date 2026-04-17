package com.prodexa.service;

import com.prodexa.entity.*;
import com.prodexa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class MachineService {

    private final MachineRepository machineRepo;

    public List<Machine> getAll() { return machineRepo.findAll(); }

    public Machine getById(Long id) {
        return machineRepo.findById(id).orElseThrow(() -> new RuntimeException("Machine not found"));
    }

    public Machine save(Machine machine) { return machineRepo.save(machine); }

    public Machine update(Long id, Machine updated) {
        Machine existing = getById(id);
        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setLocation(updated.getLocation());
        existing.setStatus(updated.getStatus());
        existing.setEfficiency(updated.getEfficiency());
        existing.setOperatorName(updated.getOperatorName());
        existing.setNotes(updated.getNotes());
        existing.setLastMaintenance(updated.getLastMaintenance());
        existing.setNextMaintenance(updated.getNextMaintenance());
        return machineRepo.save(existing);
    }

    public void delete(Long id) { machineRepo.deleteById(id); }

    public Map<String, Long> getStatusStats() {
        Map<String, Long> stats = new HashMap<>();
        for (Object[] row : machineRepo.countByStatus())
            stats.put(row[0].toString(), (Long) row[1]);
        return stats;
    }
}
