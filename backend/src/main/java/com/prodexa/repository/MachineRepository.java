package com.prodexa.repository;

import com.prodexa.entity.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MachineRepository extends JpaRepository<Machine, Long> {
    List<Machine> findByStatus(MachineStatus status);

    @Query("SELECT m.status, COUNT(m) FROM Machine m GROUP BY m.status")
    List<Object[]> countByStatus();
}
