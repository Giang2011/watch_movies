package com.netflix.services.impl;
import com.netflix.entities.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String email;

    @JsonIgnore // Để khi trả về JSON không bị lộ mật khẩu
    private String password;

    // Đổi thành List<SimpleGrantedAuthority> để serialize tốt qua Redis
    private List<SimpleGrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String username, String email, String password,
                           List<SimpleGrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    // Hàm static giúp build nhanh UserDetailsImpl từ User Entity
    public static UserDetailsImpl build(User user) {
        // Convert Set<Role> -> List<SimpleGrantedAuthority> (để serialize tốt qua Redis)
        List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toList());

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPassword(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    // Các hàm dưới đây để kiểm soát trạng thái tài khoản
    // Bạn có thể nối nó với field 'enabled' trong DB nếu muốn.
    // Tạm thời để true hết để acc luôn hoạt động.
    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
