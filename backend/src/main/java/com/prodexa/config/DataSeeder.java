package com.prodexa.config;

import com.prodexa.entity.*;
import com.prodexa.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final ProductionPlanRepository planRepo;
    private final MaterialRepository materialRepo;
    private final MachineRepository machineRepo;
    private final NotificationRepository notifRepo;
    private final AuditLogRepository auditLogRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepo.count() > 0) return;
        log.info("Seeding database...");

        // Users
        User admin = userRepo.save(User.builder().username("admin").email("admin@prodexa.com")
                .password(passwordEncoder.encode("admin123")).fullName("Alex Johnson").role(Role.ADMIN)
                .phone("+1-555-0101").department("Management").active(true)
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=admin").build());

        User pm = userRepo.save(User.builder().username("sarah.pm").email("sarah@prodexa.com")
                .password(passwordEncoder.encode("pass123")).fullName("Sarah Mitchell").role(Role.PRODUCTION_MANAGER)
                .phone("+1-555-0102").department("Production").active(true)
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=sarah").build());

        User inv = userRepo.save(User.builder().username("mike.inv").email("mike@prodexa.com")
                .password(passwordEncoder.encode("pass123")).fullName("Mike Chen").role(Role.INVENTORY_MANAGER)
                .phone("+1-555-0103").department("Inventory").active(true)
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=mike").build());

        User op = userRepo.save(User.builder().username("john.op").email("john@prodexa.com")
                .password(passwordEncoder.encode("pass123")).fullName("John Davis").role(Role.MACHINE_OPERATOR)
                .phone("+1-555-0104").department("Operations").active(true)
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=john").build());

        User qa = userRepo.save(User.builder().username("emma.qa").email("emma@prodexa.com")
                .password(passwordEncoder.encode("pass123")).fullName("Emma Wilson").role(Role.QUALITY_ANALYST)
                .phone("+1-555-0105").department("Quality").active(true)
                .avatarUrl("https://api.dicebear.com/7.x/avataaars/svg?seed=emma").build());

        // Production Plans
        planRepo.saveAll(List.of(
            ProductionPlan.builder().title("Automotive Frame Batch Q1").productName("Steel Frame A-200")
                .description("Q1 production batch for automotive frames").targetQuantity(500).completedQuantity(387)
                .status(PlanStatus.IN_PROGRESS).priority("HIGH").startDate(LocalDate.now().minusDays(15))
                .endDate(LocalDate.now().plusDays(10)).assignedTo(op).createdBy(pm).build(),
            ProductionPlan.builder().title("Electronic Housing Units").productName("PCB Housing EH-50")
                .description("Electronic housing for PCB assemblies").targetQuantity(1200).completedQuantity(1200)
                .status(PlanStatus.COMPLETED).priority("MEDIUM").startDate(LocalDate.now().minusDays(30))
                .endDate(LocalDate.now().minusDays(5)).assignedTo(op).createdBy(pm).build(),
            ProductionPlan.builder().title("Industrial Pump Components").productName("Pump Body IP-300")
                .description("Industrial pump body manufacturing").targetQuantity(200).completedQuantity(45)
                .status(PlanStatus.DELAYED).priority("HIGH").startDate(LocalDate.now().minusDays(20))
                .endDate(LocalDate.now().minusDays(2)).assignedTo(op).createdBy(pm).build(),
            ProductionPlan.builder().title("Conveyor Belt Assembly").productName("Belt Assembly CB-100")
                .description("Conveyor belt assembly for warehouse").targetQuantity(50).completedQuantity(0)
                .status(PlanStatus.PLANNED).priority("LOW").startDate(LocalDate.now().plusDays(5))
                .endDate(LocalDate.now().plusDays(25)).assignedTo(op).createdBy(pm).build(),
            ProductionPlan.builder().title("Precision Gear Set").productName("Gear Set PG-75")
                .description("High precision gear manufacturing").targetQuantity(300).completedQuantity(180)
                .status(PlanStatus.IN_PROGRESS).priority("MEDIUM").startDate(LocalDate.now().minusDays(8))
                .endDate(LocalDate.now().plusDays(12)).assignedTo(op).createdBy(pm).build()
        ));

        // Materials
        materialRepo.saveAll(List.of(
            Material.builder().name("Steel Rods Grade A").sku("MAT-001").category("Metals")
                .currentStock(45.0).minStockLevel(100.0).maxStockLevel(500.0).unit("kg")
                .unitCost(12.50).supplier("MetalCorp Inc.").supplierContact("orders@metalcorp.com")
                .location("Warehouse A-1").stockStatus(StockStatus.LOW).lastRestocked(LocalDateTime.now().minusDays(10)).build(),
            Material.builder().name("Aluminum Sheets 3mm").sku("MAT-002").category("Metals")
                .currentStock(0.0).minStockLevel(50.0).maxStockLevel(300.0).unit("sheets")
                .unitCost(8.75).supplier("AlumTech Ltd.").supplierContact("supply@alumtech.com")
                .location("Warehouse A-2").stockStatus(StockStatus.OUT_OF_STOCK).lastRestocked(LocalDateTime.now().minusDays(25)).build(),
            Material.builder().name("Industrial Lubricant").sku("MAT-003").category("Chemicals")
                .currentStock(250.0).minStockLevel(50.0).maxStockLevel(500.0).unit("liters")
                .unitCost(3.20).supplier("ChemSupply Co.").supplierContact("info@chemsupply.com")
                .location("Storage B-1").stockStatus(StockStatus.ADEQUATE).lastRestocked(LocalDateTime.now().minusDays(5)).build(),
            Material.builder().name("Copper Wire 2mm").sku("MAT-004").category("Electrical")
                .currentStock(180.0).minStockLevel(100.0).maxStockLevel(600.0).unit("meters")
                .unitCost(2.10).supplier("ElectroParts").supplierContact("sales@electroparts.com")
                .location("Warehouse C-3").stockStatus(StockStatus.ADEQUATE).lastRestocked(LocalDateTime.now().minusDays(3)).build(),
            Material.builder().name("Rubber Gaskets 50mm").sku("MAT-005").category("Seals")
                .currentStock(30.0).minStockLevel(200.0).maxStockLevel(1000.0).unit("pieces")
                .unitCost(0.85).supplier("SealMaster").supplierContact("orders@sealmaster.com")
                .location("Warehouse B-2").stockStatus(StockStatus.LOW).lastRestocked(LocalDateTime.now().minusDays(15)).build(),
            Material.builder().name("Stainless Steel Bolts M10").sku("MAT-006").category("Fasteners")
                .currentStock(5000.0).minStockLevel(1000.0).maxStockLevel(10000.0).unit("pieces")
                .unitCost(0.15).supplier("FastenerWorld").supplierContact("bulk@fastenerworld.com")
                .location("Warehouse A-3").stockStatus(StockStatus.ADEQUATE).lastRestocked(LocalDateTime.now().minusDays(2)).build(),
            Material.builder().name("Hydraulic Fluid ISO 46").sku("MAT-007").category("Chemicals")
                .currentStock(120.0).minStockLevel(50.0).maxStockLevel(400.0).unit("liters")
                .unitCost(4.50).supplier("FluidTech").supplierContact("supply@fluidtech.com")
                .location("Storage B-2").stockStatus(StockStatus.ADEQUATE).lastRestocked(LocalDateTime.now().minusDays(7)).build(),
            Material.builder().name("Carbon Fiber Sheets").sku("MAT-008").category("Composites")
                .currentStock(15.0).minStockLevel(20.0).maxStockLevel(100.0).unit("sheets")
                .unitCost(45.00).supplier("CompositePro").supplierContact("orders@compositepro.com")
                .location("Warehouse D-1").stockStatus(StockStatus.LOW).lastRestocked(LocalDateTime.now().minusDays(20)).build()
        ));

        // Machines
        machineRepo.saveAll(List.of(
            Machine.builder().name("CNC Milling Machine").machineCode("CNC-001").type("CNC")
                .location("Floor A").status(MachineStatus.ACTIVE).efficiency(94.2)
                .totalDowntimeMinutes(120).operatorName("John Davis")
                .lastMaintenance(LocalDateTime.now().minusDays(30))
                .nextMaintenance(LocalDateTime.now().plusDays(30)).build(),
            Machine.builder().name("Hydraulic Press HP-200").machineCode("HP-001").type("Press")
                .location("Floor A").status(MachineStatus.ACTIVE).efficiency(88.5)
                .totalDowntimeMinutes(240).operatorName("John Davis")
                .lastMaintenance(LocalDateTime.now().minusDays(15))
                .nextMaintenance(LocalDateTime.now().plusDays(45)).build(),
            Machine.builder().name("Laser Cutter LC-500").machineCode("LC-001").type("Laser")
                .location("Floor B").status(MachineStatus.MAINTENANCE).efficiency(0.0)
                .totalDowntimeMinutes(480).operatorName("Unassigned")
                .lastMaintenance(LocalDateTime.now())
                .nextMaintenance(LocalDateTime.now().plusDays(7))
                .notes("Scheduled maintenance - laser alignment").build(),
            Machine.builder().name("Welding Robot WR-X1").machineCode("WR-001").type("Welding")
                .location("Floor B").status(MachineStatus.ACTIVE).efficiency(91.8)
                .totalDowntimeMinutes(60).operatorName("John Davis")
                .lastMaintenance(LocalDateTime.now().minusDays(20))
                .nextMaintenance(LocalDateTime.now().plusDays(40)).build(),
            Machine.builder().name("Assembly Line A").machineCode("AL-001").type("Assembly")
                .location("Floor C").status(MachineStatus.ACTIVE).efficiency(96.1)
                .totalDowntimeMinutes(30).operatorName("John Davis")
                .lastMaintenance(LocalDateTime.now().minusDays(10))
                .nextMaintenance(LocalDateTime.now().plusDays(50)).build(),
            Machine.builder().name("Injection Molder IM-300").machineCode("IM-001").type("Molding")
                .location("Floor C").status(MachineStatus.IDLE).efficiency(0.0)
                .totalDowntimeMinutes(180).operatorName("Unassigned")
                .lastMaintenance(LocalDateTime.now().minusDays(5))
                .nextMaintenance(LocalDateTime.now().plusDays(55)).build(),
            Machine.builder().name("CNC Lathe CL-150").machineCode("CNC-002").type("CNC")
                .location("Floor A").status(MachineStatus.ACTIVE).efficiency(89.3)
                .totalDowntimeMinutes(90).operatorName("John Davis")
                .lastMaintenance(LocalDateTime.now().minusDays(25))
                .nextMaintenance(LocalDateTime.now().plusDays(35)).build(),
            Machine.builder().name("Surface Grinder SG-80").machineCode("SG-001").type("Grinding")
                .location("Floor B").status(MachineStatus.ACTIVE).efficiency(85.7)
                .totalDowntimeMinutes(150).operatorName("John Davis")
                .lastMaintenance(LocalDateTime.now().minusDays(18))
                .nextMaintenance(LocalDateTime.now().plusDays(42)).build(),
            Machine.builder().name("Coordinate Measuring CMM-1").machineCode("CMM-001").type("Measurement")
                .location("QA Lab").status(MachineStatus.ACTIVE).efficiency(99.1)
                .totalDowntimeMinutes(0).operatorName("Emma Wilson")
                .lastMaintenance(LocalDateTime.now().minusDays(7))
                .nextMaintenance(LocalDateTime.now().plusDays(83)).build(),
            Machine.builder().name("Powder Coating PC-200").machineCode("PC-001").type("Coating")
                .location("Floor D").status(MachineStatus.OFFLINE).efficiency(0.0)
                .totalDowntimeMinutes(720).operatorName("Unassigned")
                .lastMaintenance(LocalDateTime.now().minusDays(45))
                .nextMaintenance(LocalDateTime.now())
                .notes("Awaiting spare parts for repair").build()
        ));

        // Notifications
        notifRepo.saveAll(List.of(
            Notification.builder().title("Low Stock Alert").message("Steel Rods Grade A is below minimum stock level (45kg remaining, min: 100kg)")
                .type(NotificationType.LOW_STOCK).read(false).user(admin).build(),
            Notification.builder().title("Production Delay").message("Industrial Pump Components plan is 2 days overdue. Immediate action required.")
                .type(NotificationType.DELAY_ALERT).read(false).user(pm).build(),
            Notification.builder().title("Machine Maintenance Due").message("Powder Coating PC-200 maintenance is overdue. Schedule immediately.")
                .type(NotificationType.MACHINE_DOWNTIME).read(false).user(op).build(),
            Notification.builder().title("Out of Stock").message("Aluminum Sheets 3mm is completely out of stock. Production may be affected.")
                .type(NotificationType.LOW_STOCK).read(false).user(inv).build(),
            Notification.builder().title("Quality Check Required").message("Precision Gear Set batch requires quality inspection before shipping.")
                .type(NotificationType.INFO).read(false).user(qa).build(),
            Notification.builder().title("System Update").message("Prodexa ERP system updated to v2.4.1. New features available.")
                .type(NotificationType.SYSTEM).read(true).user(admin).build()
        ));

        // Audit Logs
        auditLogRepo.saveAll(List.of(
            AuditLog.builder().username("admin").action("LOGIN").resource("AUTH").details("Admin logged in").status("SUCCESS").build(),
            AuditLog.builder().username("sarah.pm").action("CREATE").resource("PRODUCTION_PLAN").details("Created plan: Automotive Frame Batch Q1").status("SUCCESS").build(),
            AuditLog.builder().username("mike.inv").action("UPDATE").resource("MATERIAL").details("Updated stock for Steel Rods Grade A").status("SUCCESS").build(),
            AuditLog.builder().username("admin").action("UPDATE").resource("USER").details("Updated role for user john.op").status("SUCCESS").build(),
            AuditLog.builder().username("emma.qa").action("LOGIN").resource("AUTH").details("QA analyst logged in").status("SUCCESS").build()
        ));

        log.info("Database seeded successfully with {} users, {} plans, {} materials, {} machines",
                userRepo.count(), planRepo.count(), materialRepo.count(), machineRepo.count());
    }
}
