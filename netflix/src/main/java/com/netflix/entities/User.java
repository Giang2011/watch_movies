package com.netflix.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "username"),
                @UniqueConstraint(columnNames = "email")
        })
@Data
public class User implements Serializable {
    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String username;

    @Column(nullable = false, length = 50)
    private String email;

    @Column(nullable = false, length = 120)
    private String password;

    // Quan hệ Many-to-Many với bảng Roles
    // FetchType.EAGER: Khi load User lên, lập tức load luôn Role đi kèm
    // (vì Spring Security cần biết quyền ngay để check login)
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "users_roles", // Tên bảng trung gian
            joinColumns = @JoinColumn(name = "user_id"), // Khóa ngoại trỏ về User
            inverseJoinColumns = @JoinColumn(name = "role_id")) // Khóa ngoại trỏ về Role
    private Set<Role> roles = new HashSet<>();

    // Constructor mặc định (Bắt buộc với JPA)
    public User() {
    }

    // Constructor tiện ích để tạo nhanh
    public User(String username, String email, String password) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

}
