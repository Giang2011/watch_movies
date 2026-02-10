package com.netflix.repositories;

import com.netflix.entities.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
    // Có thể thêm hàm tìm kiếm nếu cần, ví dụ: findByTitleContaining...
}