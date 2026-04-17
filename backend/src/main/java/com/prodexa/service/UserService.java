package com.prodexa.service;

import com.prodexa.entity.*;
import com.prodexa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

    public Page<User> getAll(int page, int size) {
        return userRepo.findAll(PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    public User getById(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User getByUsername(String username) {
        return userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User update(Long id, User updated) {
        User existing = getById(id);
        existing.setFullName(updated.getFullName());
        existing.setEmail(updated.getEmail());
        existing.setPhone(updated.getPhone());
        existing.setDepartment(updated.getDepartment());
        existing.setAvatarUrl(updated.getAvatarUrl());
        return userRepo.save(existing);
    }

    public User updateRole(Long id, Role role) {
        User user = getById(id);
        user.setRole(role);
        return userRepo.save(user);
    }

    public void changePassword(String username, String oldPass, String newPass) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(oldPass, user.getPassword()))
            throw new RuntimeException("Current password is incorrect");
        user.setPassword(passwordEncoder.encode(newPass));
        userRepo.save(user);
    }

    public void delete(Long id) {
        userRepo.deleteById(id);
    }
}
