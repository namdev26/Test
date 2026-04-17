package com.movie.controller;

import com.movie.dto.ApiResponse;
import com.movie.model.Movie;
import com.movie.model.Showtime;
import com.movie.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("ok"));
    }

    @GetMapping("/movies")
    public ResponseEntity<ApiResponse<List<Movie>>> getMovies(
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(ApiResponse.success(movieService.findAllMovies(status)));
    }

    @GetMapping("/movies/{id}")
    public ResponseEntity<ApiResponse<Movie>> getMovie(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(movieService.findMovieById(id)));
    }

    @GetMapping("/movies/{id}/showtimes")
    public ResponseEntity<ApiResponse<List<Showtime>>> getShowtimes(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(movieService.findShowtimesByMovie(id)));
    }
}
