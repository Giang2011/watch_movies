package com.netflix.controllers;

import com.netflix.dtos.MessageResponse;
import com.netflix.entities.Movie;
import com.netflix.services.impl.FavoriteService;
import com.netflix.services.impl.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class FavoriteController {

    private final FavoriteService favoriteService;

    /**
     * Thêm phim vào danh sách yêu thích
     * POST /api/favorites/{movieId}
     */
    @PostMapping("/{movieId}")
    public ResponseEntity<MessageResponse> addFavorite(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long movieId) {
        favoriteService.addFavorite(userDetails.getId(), movieId);
        return ResponseEntity.ok(new MessageResponse("Movie added to favorites!"));
    }

    /**
     * Bỏ phim khỏi danh sách yêu thích
     * DELETE /api/favorites/{movieId}
     */
    @DeleteMapping("/{movieId}")
    public ResponseEntity<MessageResponse> removeFavorite(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long movieId) {
        favoriteService.removeFavorite(userDetails.getId(), movieId);
        return ResponseEntity.ok(new MessageResponse("Movie removed from favorites!"));
    }

    /**
     * Xem danh sách phim yêu thích của user hiện tại
     * GET /api/favorites
     */
    @GetMapping
    public ResponseEntity<List<Movie>> getUserFavorites(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        List<Movie> favorites = favoriteService.getUserFavorites(userDetails.getId());
        return ResponseEntity.ok(favorites);
    }
}
