package com.prodexa.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "materials")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Material {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String sku;
    private String category;
    private Double currentStock;
    private Double minStockLevel;
    private Double maxStockLevel;
    private String unit;
    private Double unitCost;
    private String supplier;
    private String supplierContact;
    private String location;

    @Enumerated(EnumType.STRING)
    private StockStatus stockStatus;

    private LocalDateTime lastRestocked;
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() {
        createdAt = LocalDateTime.now();
        updateStockStatus();
    }

    @PreUpdate protected void onUpdate() { updateStockStatus(); }

    private void updateStockStatus() {
        if (currentStock == null || minStockLevel == null) return;
        if (currentStock <= 0) stockStatus = StockStatus.OUT_OF_STOCK;
        else if (currentStock <= minStockLevel) stockStatus = StockStatus.LOW;
        else stockStatus = StockStatus.ADEQUATE;
    }
}
