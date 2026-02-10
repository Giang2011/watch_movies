package com.netflix.dtos;

import lombok.Data;
import java.util.Set;

@Data
public class SignupRequest {
    private String username;
    private String email;
    private Set<String> role; // Danh sách role muốn đăng ký (nếu có)
    private String password;
}