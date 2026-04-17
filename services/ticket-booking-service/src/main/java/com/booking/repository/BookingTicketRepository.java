package com.booking.repository;

import com.booking.model.BookingTicket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BookingTicketRepository extends JpaRepository<BookingTicket, Long> {
    Optional<BookingTicket> findByBookingBookingId(Long bookingId);
}
