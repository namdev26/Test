package com.seat.controller;

import com.seat.dto.ApiResponse;
import com.seat.dto.HoldSeatRequest;
import com.seat.dto.SeatDto;
import com.seat.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("ok"));
    }

    @GetMapping("/showtimes/{showtimeId}/seats")
    public ResponseEntity<ApiResponse<List<SeatDto>>> getSeats(
            @PathVariable Long showtimeId) {
        return ResponseEntity.ok(ApiResponse.success(seatService.getSeatsByShowtime(showtimeId)));
    }

    @PostMapping("/showtimes/{showtimeId}/seats/{seatId}/hold")
    public ResponseEntity<ApiResponse<Map<String, Object>>> holdSeat(
            @PathVariable Long showtimeId,
            @PathVariable Long seatId,
            @Valid @RequestBody HoldSeatRequest request) {
        return ResponseEntity.ok(ApiResponse.success(seatService.holdSeat(showtimeId, seatId, request)));
    }

    @PostMapping("/showtimes/{showtimeId}/seats/{seatId}/release")
    public ResponseEntity<ApiResponse<Map<String, Object>>> releaseSeat(
            @PathVariable Long showtimeId,
            @PathVariable Long seatId) {
        return ResponseEntity.ok(ApiResponse.success(seatService.releaseSeat(showtimeId, seatId)));
    }

    @PostMapping("/showtimes/{showtimeId}/seats/{seatId}/sold")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markSold(
            @PathVariable Long showtimeId,
            @PathVariable Long seatId) {
        return ResponseEntity.ok(ApiResponse.success(seatService.markSold(showtimeId, seatId)));
    }
}
