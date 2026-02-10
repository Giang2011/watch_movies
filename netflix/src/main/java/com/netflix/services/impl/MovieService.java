package com.netflix.services.impl;

import com.netflix.entities.Movie;
import com.netflix.repositories.MovieRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;

@Service
public class MovieService {

    private static final Logger logger = LoggerFactory.getLogger(MovieService.class);

    @Autowired
    MovieRepository movieRepository;
    
    // Đường dẫn gốc tới thư mục uploads
    private final Path rootLocation = Paths.get("uploads");

    // === 1. Hàm hỗ trợ lưu file vào ổ cứng ===
    public String storeFile(MultipartFile file, String subFolder) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("File rỗng!");
            }
            // Tạo đường dẫn: uploads/videos/ten_file.mp4
            Path destinationFile = this.rootLocation.resolve(subFolder)
                    .resolve(Paths.get(file.getOriginalFilename()))
                    .normalize().toAbsolutePath();

            // Lưu file (Nếu tồn tại thì ghi đè)
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            
            // Trả về đường dẫn URL tương đối để lưu vào DB
            // Ví dụ: /uploads/videos/ten_file.mp4
            return "/uploads/" + subFolder + "/" + file.getOriginalFilename();
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file.", e);
        }
    }

    // === 2. Lấy danh sách (Có Cache) ===
    @Cacheable(value = "movies", key = "'allMovies'")
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    // === 3. Thêm mới (Xóa Cache) ===
    @Transactional
    @CacheEvict(value = "movies", key = "'allMovies'")
    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    // === 4. CẬP NHẬT (Update) - PUT ===
    // Khi update, ta cần xóa cache của list movie
    @Transactional
    @CacheEvict(value = "movies", key = "'allMovies'") 
    public Movie updateMovie(Long id, Movie movieDetails) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phim với ID: " + id));

        // Cập nhật thông tin
        movie.setTitle(movieDetails.getTitle());
        movie.setDescription(movieDetails.getDescription());
        movie.setReleaseYear(movieDetails.getReleaseYear());
        
        // XÓA FILE CŨ NẾU CÓ FILE MỚI
        if (movieDetails.getVideoUrl() != null) {
            deleteFileFromUrl(movie.getVideoUrl()); // Xóa video cũ
            movie.setVideoUrl(movieDetails.getVideoUrl());
        }
        if (movieDetails.getThumbnailUrl() != null) {
            deleteFileFromUrl(movie.getThumbnailUrl()); // Xóa thumbnail cũ
            movie.setThumbnailUrl(movieDetails.getThumbnailUrl());
        }

        return movieRepository.save(movie);
    }

    // --- HÀM MỚI: XÓA PHIM ---
    @Transactional
    @CacheEvict(value = "movies", key = "'allMovies'") // Xóa cache danh sách
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy phim với ID: " + id)); // Lấy thông tin phim trước khi xóa để lấy đường dẫn file

        // 1. Xóa file vật lý (Ảnh & Video)
        deleteFileFromUrl(movie.getThumbnailUrl());
        deleteFileFromUrl(movie.getVideoUrl());

        // 2. Xóa trong Database
        movieRepository.deleteById(id);
    }

    // Hàm phụ: Xóa file vật lý từ URL
    private void deleteFileFromUrl(String fileUrl) {
        if (fileUrl != null && !fileUrl.isEmpty()) {
            try {
                // URL dạng: /uploads/images/abc.jpg hoặc /uploads/videos/xyz.mp4
                // Cần lấy phần sau /uploads/ → images/abc.jpg hoặc videos/xyz.mp4
                String relativePath = fileUrl.replace("/uploads/", "");
                Path filePath = this.rootLocation.resolve(relativePath);
                
                boolean deleted = Files.deleteIfExists(filePath);
                if (deleted) {
                    logger.info("Đã xóa file: {}", filePath);
                } else {
                    logger.warn("File không tồn tại: {}", filePath);
                }
            } catch (IOException e) {
                logger.error("Không thể xóa file: {} - Lỗi: {}", fileUrl, e.getMessage());
                // Không ném exception để không rollback transaction DB
            }
        }
    }
}