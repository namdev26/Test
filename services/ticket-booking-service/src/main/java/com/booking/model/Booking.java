package com.booking.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;

    @Column(name = "showtime_id", nullable = false)
    private Long showtimeId;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @ElementCollection
    @CollectionTable(name = "booking_seats", joinColumns = @JoinColumn(name = "booking_id"))
    @Column(name = "seat_id")
    @Builder.Default
    private List<Long> seatIds = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING_PAYMENT;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();

    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private BookingTicket ticket;

    public enum BookingStatus {
        PENDING_PAYMENT, CONFIRMED, CANCELLED, FAILED
    }
}
