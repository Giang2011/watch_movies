package com.netflix.controllers;

import com.netflix.entities.Movie;
import com.netflix.services.impl.MovieService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MovieController {

    @Autowired
    MovieService movieService;

    @GetMapping
    public ResponseEntity<List<Movie>> getMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    // === API THÊM MỚI (POST) CÓ UPLOAD FILE ===
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addMovie(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("releaseYear") Integer releaseYear,
            @RequestParam("thumbnail") MultipartFile thumbnailFile, // File ảnh
            @RequestParam("video") MultipartFile videoFile          // File phim
    ) {
        try {
            // 1. Lưu file vật lý
            String thumbnailUrl = movieService.storeFile(thumbnailFile, "images");
            String videoUrl = movieService.storeFile(videoFile, "videos");

            // 2. Tạo đối tượng Movie và lưu DB
            Movie movie = new Movie();
            movie.setTitle(title);
            movie.setDescription(description);
            movie.setReleaseYear(releaseYear);
            movie.setThumbnailUrl(thumbnailUrl);
            movie.setVideoUrl(videoUrl);

            return ResponseEntity.ok(movieService.addMovie(movie));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi thêm phim: " + e.getMessage());
        }
    }

    // === API CẬP NHẬT (PUT) ===
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateMovie(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("releaseYear") Integer releaseYear,
            // required = false nghĩa là: User có thể không cần up lại file nếu không muốn đổi
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnailFile,
            @RequestParam(value = "video", required = false) MultipartFile videoFile
    ) {
        try {
            Movie movieDetails = new Movie();
            movieDetails.setTitle(title);
            movieDetails.setDescription(description);
            movieDetails.setReleaseYear(releaseYear);

            // Nếu có gửi file mới thì lưu và cập nhật URL, không thì thôi
            if (thumbnailFile != null && !thumbnailFile.isEmpty()) {
                String thumbUrl = movieService.storeFile(thumbnailFile, "images");
                movieDetails.setThumbnailUrl(thumbUrl);
            }
            if (videoFile != null && !videoFile.isEmpty()) {
                String vidUrl = movieService.storeFile(videoFile, "videos");
                movieDetails.setVideoUrl(vidUrl);
            }

            return ResponseEntity.ok(movieService.updateMovie(id, movieDetails));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi cập nhật phim: " + e.getMessage());
        }
    }

    // API DELETE
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ Admin được xóa
    public ResponseEntity<?> deleteMovie(@PathVariable Long id) {
        try {
            movieService.deleteMovie(id);
            return ResponseEntity.ok("Xóa phim thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi xóa phim: " + e.getMessage());
        }
    }
}