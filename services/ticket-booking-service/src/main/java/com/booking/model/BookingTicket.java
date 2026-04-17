package com.booking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ticketId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "ticket_code", nullable = false, unique = true)
    private String ticketCode;

    @Column(name = "qr_data")
    private String qrData;
}
