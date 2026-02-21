package com.netflix.services.impl;

import com.netflix.entities.Favorite;
import com.netflix.entities.FavoriteId;
import com.netflix.entities.Movie;
import com.netflix.entities.User;
import com.netflix.repositories.FavoriteRepository;
import com.netflix.repositories.MovieRepository;
import com.netflix.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final UserRepository userRepository;
    private final MovieRepository movieRepository;

    @Transactional
    public void addFavorite(Long userId, Long movieId) {
        FavoriteId favoriteId = new FavoriteId(userId, movieId);

        if (favoriteRepository.existsById(favoriteId)) {
            throw new RuntimeException("Movie is already in favorites");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + movieId));

        Favorite favorite = new Favorite(user, movie);
        favoriteRepository.save(favorite);
        log.debug("User {} added movie {} to favorites", userId, movieId);
    }

    @Transactional
    public void removeFavorite(Long userId, Long movieId) {
        FavoriteId favoriteId = new FavoriteId(userId, movieId);

        if (!favoriteRepository.existsById(favoriteId)) {
            throw new RuntimeException("Movie is not in favorites");
        }

        favoriteRepository.deleteById(favoriteId);
        log.debug("User {} removed movie {} from favorites", userId, movieId);
    }

    @Transactional(readOnly = true)
    public List<Movie> getUserFavorites(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found with ID: " + userId);
        }
        return favoriteRepository.findMoviesByUserId(userId);
    }
}
