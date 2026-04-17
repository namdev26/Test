package com.payment.repository;

import com.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByGatewayRef(String gatewayRef);
    Optional<Payment> findByBookingId(Long bookingId);
}
