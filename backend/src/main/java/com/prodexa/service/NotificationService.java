package com.prodexa.service;

import com.prodexa.entity.*;
import com.prodexa.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notifRepo;
    private final UserRepository userRepo;

    public List<Notification> getUserNotifications(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        return notifRepo.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public long getUnreadCount(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        return notifRepo.countByUserIdAndReadFalse(user.getId());
    }

    public void markAllRead(String username) {
        User user = userRepo.findByUsername(username).orElseThrow();
        List<Notification> unread = notifRepo.findByUserIdAndReadFalse(user.getId());
        unread.forEach(n -> n.setRead(true));
        notifRepo.saveAll(unread);
    }

    public Notification create(Notification notification) {
        return notifRepo.save(notification);
    }
}
