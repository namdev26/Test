package com.payment.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long paymentId;

    @Column(name = "booking_id", nullable = false)
    private Long bookingId;

    @Column(nullable = false)
    private Long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "gateway_ref", nullable = false, unique = true)
    private String gatewayRef;

    @Column(name = "card_holder")
    private String cardHolder;

    @Column(name = "card_last4")
    private String cardLast4;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();

    public enum PaymentStatus {
        PENDING, SUCCESS, FAILED
    }
}
