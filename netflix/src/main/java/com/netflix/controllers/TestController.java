package com.netflix.controllers;


import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/test")
public class TestController {

    // Ai cũng vào được (Không cần Token)
    // Lưu ý: Phải cấu hình .permitAll() trong SecurityConfig cho đường dẫn này thì mới thực sự public
    @GetMapping("/all")
    public String allAccess() {
        return "Public Content.";
    }

    // Phải có Token (Đăng nhập rồi là được, không quan tâm Role)
    @GetMapping("/user")
    @PreAuthorize("hasRole('USER') or hasRole('MANAGER') or hasRole('ADMIN')")
    public String userAccess() {
        return "User Content.";
    }

    // Chỉ MANAGER mới vào được
    @GetMapping("/mod")
    @PreAuthorize("hasRole('MANAGER')")
    public String moderatorAccess() {
        return "Moderator Board.";
    }

    // Chỉ ADMIN mới vào được
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminAccess() {
        return "Admin Board.";
    }
}
