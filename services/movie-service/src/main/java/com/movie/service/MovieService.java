package com.movie.service;

import com.movie.exception.ResourceNotFoundException;
import com.movie.model.Movie;
import com.movie.model.Showtime;
import com.movie.repository.MovieRepository;
import com.movie.repository.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;

    public List<Movie> findAllMovies(String status) {
        if (status == null || status.isBlank()) {
            return movieRepository.findAll();
        }
        return movieRepository.findByStatus(Movie.MovieStatus.valueOf(status));
    }

    public Movie findMovieById(Long id) {
        return movieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie not found: " + id));
    }

    public List<Showtime> findShowtimesByMovie(Long movieId) {
        findMovieById(movieId); // validate movie exists
        return showtimeRepository.findByMovieId(movieId);
    }
}
