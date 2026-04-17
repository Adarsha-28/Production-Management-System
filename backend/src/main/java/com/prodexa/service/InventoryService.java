package com.prodexa.service;

import com.prodexa.entity.*;
import com.prodexa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final MaterialRepository materialRepo;

    public Page<Material> getAll(int page, int size) {
        return materialRepo.findAll(PageRequest.of(page, size, Sort.by("name")));
    }

    public Material getById(Long id) {
        return materialRepo.findById(id).orElseThrow(() -> new RuntimeException("Material not found"));
    }

    public Material save(Material material) { return materialRepo.save(material); }

    public Material update(Long id, Material updated) {
        Material existing = getById(id);
        existing.setName(updated.getName());
        existing.setSku(updated.getSku());
        existing.setCategory(updated.getCategory());
        existing.setCurrentStock(updated.getCurrentStock());
        existing.setMinStockLevel(updated.getMinStockLevel());
        existing.setMaxStockLevel(updated.getMaxStockLevel());
        existing.setUnit(updated.getUnit());
        existing.setUnitCost(updated.getUnitCost());
        existing.setSupplier(updated.getSupplier());
        existing.setSupplierContact(updated.getSupplierContact());
        existing.setLocation(updated.getLocation());
        return materialRepo.save(existing);
    }

    public void delete(Long id) { materialRepo.deleteById(id); }

    public List<Material> getLowStock() { return materialRepo.findByStockStatus(StockStatus.LOW); }

    public long getLowStockCount() { return materialRepo.countLowStock(); }
}
