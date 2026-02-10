package com.netflix.security;


import com.netflix.services.impl.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtils {

    // ĐÂY LÀ KHÓA BÍ MẬT - TUYỆT ĐỐI KHÔNG ĐỂ LỘ
    // Trong thực tế, bạn nên để chuỗi này trong file application.properties
    // Chuỗi này phải đủ dài (ít nhất 256-bit) để thuật toán HS256 hoạt động
    @Value("${jwt.secret}")
    private String jwtSecret;

    // Thời gian hết hạn của Token (tính bằng mili-giây)
    // Ví dụ: 86400000 ms = 1 ngày
    @Value("${jwt.expiration}")
    private int jwtExpirationMs;

    // 1. Tạo Token
    public String generateJwtToken(UserDetailsImpl userPrincipal) {
        return Jwts.builder()
                .setSubject((userPrincipal.getUsername()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    // Lấy Key mã hóa
    private Key key() {
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret)); // Giải mã Base64 trước khi dùng
    }

    // 2. Lấy Username từ Token
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    // 3. Validate Token (Kiểm tra xem có hợp lệ không)
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            return true;
        } catch (MalformedJwtException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            System.err.println("JWT token is expired: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            System.err.println("JWT token is unsupported: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            System.err.println("JWT claims string is empty: " + e.getMessage());
        }
        return false;
    }
}