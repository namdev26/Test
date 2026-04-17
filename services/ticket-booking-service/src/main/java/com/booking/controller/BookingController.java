package com.booking.controller;

import com.booking.dto.ApiResponse;
import com.booking.dto.CreateBookingRequest;
import com.booking.dto.TicketDto;
import com.booking.model.Booking;
import com.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("ok"));
    }

    @PostMapping("/bookings")
    public ResponseEntity<ApiResponse<Object>> createBooking(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody CreateBookingRequest request) {
        Object result = bookingService.createBooking(idempotencyKey, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(result));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<ApiResponse<Booking>> getBooking(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBooking(id)));
    }

    @PostMapping("/bookings/{id}/cancel")
    public ResponseEntity<ApiResponse<Booking>> cancelBooking(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.cancelBooking(id)));
    }

    @GetMapping("/bookings/{id}/ticket")
    public ResponseEntity<ApiResponse<TicketDto>> getTicket(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getTicket(id)));
    }

    // Internal endpoints — called by payment-service
    @PostMapping("/internal/bookings/{id}/confirm")
    public ResponseEntity<ApiResponse<TicketDto>> confirm(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.confirmBooking(id)));
    }

    @PostMapping("/internal/bookings/{id}/fail")
    public ResponseEntity<ApiResponse<Void>> fail(@PathVariable Long id) {
        bookingService.failBooking(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
