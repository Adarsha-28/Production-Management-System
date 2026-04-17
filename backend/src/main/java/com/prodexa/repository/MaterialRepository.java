package com.prodexa.repository;

import com.prodexa.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MaterialRepository extends JpaRepository<Material, Long> {
    List<Material> findByStockStatus(StockStatus status);
    List<Material> findByCategory(String category);

    @Query("SELECT COUNT(m) FROM Material m WHERE m.stockStatus = 'LOW' OR m.stockStatus = 'OUT_OF_STOCK'")
    long countLowStock();
}
