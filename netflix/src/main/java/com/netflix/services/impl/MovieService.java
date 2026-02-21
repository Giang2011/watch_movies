package com.netflix.services.impl;

import com.netflix.entities.Movie;
import com.netflix.repositories.MovieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@RequiredArgsConstructor
@Slf4j
public class MovieService {

    private static final String CACHE_NAME = "movies";
    private static final String CACHE_KEY = "'allMovies'";

    private final MovieRepository movieRepository;
    private final Path rootLocation = Paths.get("uploads");

    public String storeFile(MultipartFile file, String subFolder) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        try {
            Path destinationFile = rootLocation.resolve(subFolder)
                    .resolve(Paths.get(file.getOriginalFilename()))
                    .normalize().toAbsolutePath();

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/uploads/" + subFolder + "/" + file.getOriginalFilename();
        } catch (IOException e) {
            throw new RuntimeException("Could not store file", e);
        }
    }

    @Cacheable(value = CACHE_NAME, key = CACHE_KEY)
    public List<Movie> getAllMovies() {
        return movieRepository.findAll();
    }

    @Transactional
    @CacheEvict(value = CACHE_NAME, key = CACHE_KEY)
    public Movie addMovie(Movie movie) {
        return movieRepository.save(movie);
    }

    @Transactional
    @CacheEvict(value = CACHE_NAME, key = CACHE_KEY)
    public Movie updateMovie(Long id, Movie movieDetails) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + id));

        movie.setTitle(movieDetails.getTitle());
        movie.setDescription(movieDetails.getDescription());
        movie.setReleaseYear(movieDetails.getReleaseYear());

        if (movieDetails.getVideoUrl() != null) {
            deleteFileFromUrl(movie.getVideoUrl());
            movie.setVideoUrl(movieDetails.getVideoUrl());
        }
        if (movieDetails.getThumbnailUrl() != null) {
            deleteFileFromUrl(movie.getThumbnailUrl());
            movie.setThumbnailUrl(movieDetails.getThumbnailUrl());
        }

        return movieRepository.save(movie);
    }

    public List<Long> searchMovieIdsByTitle(String keyword) {
        return movieRepository.searchIdsByTitle(keyword);
    }

    @Transactional
    @CacheEvict(value = CACHE_NAME, key = CACHE_KEY)
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Movie not found with ID: " + id));

        deleteFileFromUrl(movie.getThumbnailUrl());
        deleteFileFromUrl(movie.getVideoUrl());
        movieRepository.deleteById(id);
    }

    private void deleteFileFromUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }
        try {
            String relativePath = fileUrl.replace("/uploads/", "");
            Path filePath = rootLocation.resolve(relativePath);
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.info("Deleted file: {}", filePath);
            } else {
                log.warn("File not found: {}", filePath);
            }
        } catch (IOException e) {
            log.error("Could not delete file: {} - Error: {}", fileUrl, e.getMessage());
        }
    }
}