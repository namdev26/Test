package com.seat.repository;

import com.seat.model.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByShowtimeId(Long showtimeId);
    Optional<Seat> findByShowtimeIdAndSeatId(Long showtimeId, Long seatId);
    boolean existsByShowtimeId(Long showtimeId);
}
