package com.movie.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "showtimes")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Showtime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long showtimeId;

    @Column(name = "movie_id", nullable = false)
    private Long movieId;

    @Column(name = "theater_name", nullable = false)
    private String theaterName;

    @Column(name = "room_name", nullable = false)
    private String roomName;

    @Column(name = "start_time", nullable = false)
    private Instant startTime;

    @Column(nullable = false)
    private Integer price;
}
