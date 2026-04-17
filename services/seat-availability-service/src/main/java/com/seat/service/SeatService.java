package com.seat.service;

import com.seat.dto.HoldSeatRequest;
import com.seat.dto.SeatDto;
import com.seat.exception.ResourceNotFoundException;
import com.seat.exception.SeatUnavailableException;
import com.seat.model.Seat;
import com.seat.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;

    public List<SeatDto> getSeatsByShowtime(Long showtimeId) {
        return seatRepository.findByShowtimeId(showtimeId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public Map<String, Object> holdSeat(Long showtimeId, Long seatId, HoldSeatRequest req) {
        Seat seat = getSeat(showtimeId, seatId);
        if (seat.getStatus() != Seat.SeatStatus.AVAILABLE) {
            throw new SeatUnavailableException(seatId);
        }
        seat.setStatus(Seat.SeatStatus.HELD);
        seat.setBookingId(req.getBookingId());
        seatRepository.save(seat);
        log.info("Seat {} held for booking {}", seatId, req.getBookingId());
        return Map.of("showtime_id", showtimeId, "seat_id", seatId, "status", "HELD");
    }

    @Transactional
    public Map<String, Object> releaseSeat(Long showtimeId, Long seatId) {
        Seat seat = getSeat(showtimeId, seatId);
        seat.setStatus(Seat.SeatStatus.AVAILABLE);
        seat.setBookingId(null);
        seatRepository.save(seat);
        log.info("Seat {} released", seatId);
        return Map.of("showtime_id", showtimeId, "seat_id", seatId, "status", "AVAILABLE");
    }

    @Transactional
    public Map<String, Object> markSold(Long showtimeId, Long seatId) {
        Seat seat = getSeat(showtimeId, seatId);
        seat.setStatus(Seat.SeatStatus.SOLD);
        seatRepository.save(seat);
        log.info("Seat {} marked SOLD", seatId);
        return Map.of("showtime_id", showtimeId, "seat_id", seatId, "status", "SOLD");
    }

    private Seat getSeat(Long showtimeId, Long seatId) {
        return seatRepository.findByShowtimeIdAndSeatId(showtimeId, seatId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Seat " + seatId + " not found in showtime " + showtimeId));
    }

    private SeatDto toDto(Seat seat) {
        SeatDto dto = new SeatDto();
        dto.setSeatId(seat.getSeatId());
        dto.setRow(seat.getRow());
        dto.setNumber(seat.getNumber());
        dto.setStatus(seat.getStatus().name());
        return dto;
    }
}
