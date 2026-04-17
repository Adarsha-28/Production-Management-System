package com.prodexa.dto;

import com.prodexa.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String fullName;
    private Role role;
    private String phone;
    private String department;
}
