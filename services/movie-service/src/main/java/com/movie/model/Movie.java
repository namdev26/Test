package com.movie.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "movies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private String rating;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private MovieStatus status;

    public enum MovieStatus {
        NOW_SHOWING, COMING_SOON
    }
}
