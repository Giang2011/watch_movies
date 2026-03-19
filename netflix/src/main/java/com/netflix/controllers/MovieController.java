package com.netflix.controllers;

import com.netflix.dtos.MessageResponse;
import com.netflix.entities.Movie;
import com.netflix.services.impl.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping
    public ResponseEntity<Page<Movie>> getMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(movieService.getAllMovies(page, size));
    }

    /**
     * Tìm kiếm phim theo tên, trả về danh sách ID
     * GET /api/movies/search?keyword=abc
     */
    @GetMapping("/search")
    public ResponseEntity<List<Long>> searchMovies(@RequestParam("keyword") String keyword) {
        return ResponseEntity.ok(movieService.searchMovieIdsByTitle(keyword));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Movie> addMovie(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("releaseYear") Integer releaseYear,
            @RequestParam("thumbnail") MultipartFile thumbnailFile,
            @RequestParam("video") MultipartFile videoFile) {

        String thumbnailUrl = movieService.storeFile(thumbnailFile, "images");
        String videoUrl = movieService.storeFile(videoFile, "videos");

        Movie movie = new Movie();
        movie.setTitle(title);
        movie.setDescription(description);
        movie.setReleaseYear(releaseYear);
        movie.setThumbnailUrl(thumbnailUrl);
        movie.setVideoUrl(videoUrl);

        return ResponseEntity.ok(movieService.addMovie(movie));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Movie> updateMovie(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("releaseYear") Integer releaseYear,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnailFile,
            @RequestParam(value = "video", required = false) MultipartFile videoFile) {

        Movie movieDetails = new Movie();
        movieDetails.setTitle(title);
        movieDetails.setDescription(description);
        movieDetails.setReleaseYear(releaseYear);

        if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
            movieDetails.setThumbnailUrl(movieService.storeFile(thumbnailFile, "images"));
        }
        if (videoFile != null && !videoFile.isEmpty()) {
            movieDetails.setVideoUrl(movieService.storeFile(videoFile, "videos"));
        }

        return ResponseEntity.ok(movieService.updateMovie(id, movieDetails));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MessageResponse> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(new MessageResponse("Movie deleted successfully!"));
    }
}