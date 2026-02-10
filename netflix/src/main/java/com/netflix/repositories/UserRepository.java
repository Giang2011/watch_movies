package com.netflix.repositories;

import com.netflix.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Câu lệnh này chỉ tìm User, KHÔNG kèm Role (Dùng cho các chức năng thường)
    Optional<User> findByUsername(String username);

    // Câu lệnh này tìm User VÀ ép load luôn Roles (Dùng chuyên cho chức năng Login)
    // JOIN FETCH chính là chìa khóa để tránh lỗi LazyInitializationException
    @Query("SELECT u FROM User u JOIN FETCH u.roles WHERE u.username = :username")
    Optional<User> findByUsernameWithRoles(String username);

    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);
}
