package com.netflix.repositories;

import com.netflix.entities.Favorite;
import com.netflix.entities.FavoriteId;
import com.netflix.entities.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoriteRepository extends JpaRepository<Favorite, FavoriteId> {

    @Query("SELECT f.movie FROM Favorite f WHERE f.user.id = :userId")
    List<Movie> findMoviesByUserId(@Param("userId") Long userId);

    boolean existsById(FavoriteId id);
}
