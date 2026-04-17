package com.prodexa.controller;

import com.prodexa.entity.User;
import com.prodexa.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getByUsername(userDetails.getUsername()));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateMe(@AuthenticationPrincipal UserDetails userDetails,
                                          @RequestBody User updated) {
        User current = userService.getByUsername(userDetails.getUsername());
        return ResponseEntity.ok(userService.update(current.getId(), updated));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@AuthenticationPrincipal UserDetails userDetails,
                                                @RequestBody Map<String, String> body) {
        userService.changePassword(userDetails.getUsername(), body.get("oldPassword"), body.get("newPassword"));
        return ResponseEntity.ok().build();
    }
}
