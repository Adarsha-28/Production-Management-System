package com.prodexa.repository;

import com.prodexa.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
}
