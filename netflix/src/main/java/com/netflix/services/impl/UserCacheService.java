package com.netflix.services.impl;

import com.netflix.entities.User;
import com.netflix.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserCacheService {

    private static final String USER_CACHE_PREFIX = "auth:user:";
    private static final long CACHE_TTL_MINUTES = 10;

    private final RedisTemplate<String, Object> redisTemplate;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserDetails loadUserFromCache(String username) throws UsernameNotFoundException {
        String redisKey = USER_CACHE_PREFIX + username;

        try {
            Map<Object, Object> cached = redisTemplate.opsForHash().entries(redisKey);
            if (cached != null && !cached.isEmpty()) {
                log.debug("Cache HIT for user: {}", username);
                return buildUserDetailsFromCache(cached);
            }
        } catch (Exception e) {
            log.warn("Error reading Redis cache for user {}: {}", username, e.getMessage());
        }

        log.debug("Cache MISS for user: {}, querying DB...", username);
        User user = userRepository.findByUsernameWithRoles(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found: " + username));

        try {
            saveUserToCache(redisKey, user);
        } catch (Exception e) {
            log.warn("Error writing Redis cache for user {}: {}", username, e.getMessage());
        }

        return UserDetailsImpl.build(user);
    }

    private void saveUserToCache(String redisKey, User user) {
        Map<String, String> data = new HashMap<>();
        data.put("id", String.valueOf(user.getId()));
        data.put("username", user.getUsername());
        data.put("email", user.getEmail());

        String rolesStr = user.getRoles().stream()
                .map(role -> role.getName())
                .collect(Collectors.joining(","));
        data.put("roles", rolesStr);

        redisTemplate.opsForHash().putAll(redisKey, data);
        redisTemplate.expire(redisKey, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
    }

    private UserDetails buildUserDetailsFromCache(Map<Object, Object> cached) {
        Long id = Long.parseLong((String) cached.get("id"));
        String username = (String) cached.get("username");
        String email = (String) cached.get("email");
        String rolesStr = (String) cached.get("roles");

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        if (rolesStr != null && !rolesStr.isEmpty()) {
            for (String role : rolesStr.split(",")) {
                authorities.add(new SimpleGrantedAuthority(role.trim()));
            }
        }

        return new UserDetailsImpl(id, username, email, null, authorities);
    }

    public void evictUserCache(String username) {
        try {
            redisTemplate.delete(USER_CACHE_PREFIX + username);
            log.debug("Evicted cache for user: {}", username);
        } catch (Exception e) {
            log.warn("Error evicting cache for user {}: {}", username, e.getMessage());
        }
    }

    public void evictAllUserCache() {
        try {
            Set<String> keys = redisTemplate.keys(USER_CACHE_PREFIX + "*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.debug("Evicted {} user cache entries", keys.size());
            }
        } catch (Exception e) {
            log.warn("Error evicting all user cache: {}", e.getMessage());
        }
    }
}
