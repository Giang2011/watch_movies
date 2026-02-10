package com.netflix.services.impl;

import com.netflix.entities.User;
import com.netflix.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Service riêng để cache thông tin User vào Redis bằng RedisTemplate thủ công.
 * Chỉ lưu dữ liệu đơn giản (String, Long) để tránh hoàn toàn vấn đề
 * Jackson serialize/deserialize SimpleGrantedAuthority.
 */
@Service
public class UserCacheService {

    private static final Logger logger = LoggerFactory.getLogger(UserCacheService.class);

    // Prefix cho key trong Redis, tránh xung đột với các cache khác (movies, ...)
    private static final String USER_CACHE_PREFIX = "auth:user:";
    // Thời gian cache: 10 phút
    private static final long CACHE_TTL_MINUTES = 10;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private UserRepository userRepository;

    /**
     * Lấy UserDetails từ Redis cache.
     * Nếu cache MISS → query DB → lưu vào Redis → trả về.
     * Nếu cache HIT → build UserDetailsImpl từ dữ liệu đơn giản trong Redis → trả về.
     */
    @Transactional(readOnly = true)
    public UserDetails loadUserFromCache(String username) throws UsernameNotFoundException {
        String redisKey = USER_CACHE_PREFIX + username;

        try {
            // 1. Thử lấy từ Redis
            Map<Object, Object> cached = redisTemplate.opsForHash().entries(redisKey);

            if (cached != null && !cached.isEmpty()) {
                // Cache HIT → build UserDetailsImpl từ dữ liệu đơn giản
                logger.debug("Cache HIT cho user: {}", username);
                return buildUserDetailsFromCache(cached);
            }
        } catch (Exception e) {
            // Nếu Redis lỗi, log và tiếp tục query DB
            logger.warn("Lỗi đọc Redis cache cho user {}: {}", username, e.getMessage());
        }

        // 2. Cache MISS → query DB
        logger.debug("Cache MISS cho user: {}, query DB...", username);
        User user = userRepository.findByUsernameWithRoles(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));

        // 3. Lưu vào Redis dạng Hash đơn giản
        try {
            saveUserToCache(redisKey, user);
        } catch (Exception e) {
            logger.warn("Lỗi ghi Redis cache cho user {}: {}", username, e.getMessage());
        }

        // 4. Trả về UserDetailsImpl (không có password vì dùng cho filter, không phải login)
        return UserDetailsImpl.build(user);
    }

    /**
     * Lưu thông tin User vào Redis dưới dạng Hash đơn giản.
     * Chỉ lưu: id, username, email, roles (dạng chuỗi phân tách bởi dấu phẩy)
     * → Hoàn toàn tránh vấn đề Jackson serialize class phức tạp.
     */
    private void saveUserToCache(String redisKey, User user) {
        Map<String, String> data = new HashMap<>();
        data.put("id", String.valueOf(user.getId()));
        data.put("username", user.getUsername());
        data.put("email", user.getEmail());

        // Lưu roles dạng chuỗi: "ROLE_USER,ROLE_ADMIN"
        String rolesStr = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.joining(","));
        data.put("roles", rolesStr);

        redisTemplate.opsForHash().putAll(redisKey, data);
        redisTemplate.expire(redisKey, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
    }

    /**
     * Build UserDetailsImpl từ dữ liệu Hash đơn giản trong Redis.
     * Không dùng Jackson deserialize → không bao giờ bị lỗi role.
     */
    private UserDetails buildUserDetailsFromCache(Map<Object, Object> cached) {
        Long id = Long.parseLong((String) cached.get("id"));
        String username = (String) cached.get("username");
        String email = (String) cached.get("email");
        String rolesStr = (String) cached.get("roles");

        // Parse roles từ chuỗi đơn giản "ROLE_USER,ROLE_ADMIN"
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        if (rolesStr != null && !rolesStr.isEmpty()) {
            for (String role : rolesStr.split(",")) {
                authorities.add(new SimpleGrantedAuthority(role.trim()));
            }
        }

        // Trả về UserDetailsImpl không có password (đã verify JWT rồi)
        return new UserDetailsImpl(id, username, email, null, authorities);
    }

    /**
     * Xóa cache của 1 user cụ thể
     */
    public void evictUserCache(String username) {
        try {
            redisTemplate.delete(USER_CACHE_PREFIX + username);
            logger.debug("Đã xóa cache cho user: {}", username);
        } catch (Exception e) {
            logger.warn("Lỗi xóa cache cho user {}: {}", username, e.getMessage());
        }
    }

    /**
     * Xóa toàn bộ cache user (dùng khi có user mới hoặc bulk update)
     */
    public void evictAllUserCache() {
        try {
            Set<String> keys = redisTemplate.keys(USER_CACHE_PREFIX + "*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                logger.debug("Đã xóa {} user cache entries", keys.size());
            }
        } catch (Exception e) {
            logger.warn("Lỗi xóa toàn bộ user cache: {}", e.getMessage());
        }
    }
}
