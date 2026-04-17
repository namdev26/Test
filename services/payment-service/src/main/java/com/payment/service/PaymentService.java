package com.payment.service;

import com.payment.config.RabbitMQConfig;
import com.payment.dto.CallbackRequest;
import com.payment.dto.CreatePaymentRequest;
import com.payment.dto.NotificationEvent;
import com.payment.exception.ResourceNotFoundException;
import com.payment.model.Payment;
import com.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final RabbitTemplate    rabbitTemplate;
    private final RestTemplate      restTemplate;

    @Value("${booking.service.url}")
    private String bookingServiceUrl;

    private final Map<String, Object> idempotencyStore = new ConcurrentHashMap<>();

    @Transactional
    public Payment createPayment(String idempotencyKey, CreatePaymentRequest req) {
        if (idempotencyStore.containsKey(idempotencyKey)) {
            log.info("Idempotent payment request: {}", idempotencyKey);
            return (Payment) idempotencyStore.get(idempotencyKey);
        }

        String gatewayRef = "GW-" + Instant.now().toEpochMilli();
        String last4 = req.getCardNumber().length() >= 4
                ? req.getCardNumber().substring(req.getCardNumber().length() - 4)
                : "****";

        Payment payment = Payment.builder()
                .bookingId(req.getBookingId())
                .amount(req.getAmount())
                .gatewayRef(gatewayRef)
                .cardHolder(req.getCardHolder())
                .cardLast4(last4)
                .build();

        Payment saved = paymentRepository.save(payment);
        idempotencyStore.put(idempotencyKey, saved);
        log.info("Payment created: id={} bookingId={} ref={}", saved.getPaymentId(), req.getBookingId(), gatewayRef);
        return saved;
    }

    public Payment getPayment(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found: " + id));
    }

    @Transactional
    public Map<String, Object> handleCallback(CallbackRequest req) {
        Payment payment = paymentRepository.findByGatewayRef(req.getGatewayRef())
                .or(() -> paymentRepository.findByBookingId(req.getBookingId()))
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for ref: " + req.getGatewayRef()));

        String status = req.getStatus();
        if (!status.equals("SUCCESS") && !status.equals("FAILED")) {
            throw new IllegalArgumentException("status must be SUCCESS or FAILED");
        }

        payment.setStatus(Payment.PaymentStatus.valueOf(status));
        paymentRepository.save(payment);

        if ("SUCCESS".equals(status)) {
            // 1. Confirm booking and get ticket
            String ticketCode = confirmBooking(payment.getBookingId());

            // 2. Publish to RabbitMQ
            NotificationEvent event = NotificationEvent.success(
                    payment.getBookingId(), ticketCode, payment.getAmount().doubleValue());
            rabbitTemplate.convertAndSend(RabbitMQConfig.BOOKING_EXCHANGE, RabbitMQConfig.SUCCESS_ROUTING_KEY, event);
            log.info("Published BOOKING_CONFIRMED event for bookingId={}", payment.getBookingId());

        } else {
            // 1. Fail booking (releases seats)
            failBooking(payment.getBookingId());

            // 2. Publish to RabbitMQ
            NotificationEvent event = NotificationEvent.failed(
                    payment.getBookingId(), payment.getAmount().doubleValue());
            rabbitTemplate.convertAndSend(RabbitMQConfig.BOOKING_EXCHANGE, RabbitMQConfig.FAILED_ROUTING_KEY, event);
            log.info("Published BOOKING_FAILED event for bookingId={}", payment.getBookingId());
        }

        return Map.of("payment_id", payment.getPaymentId(), "status", payment.getStatus().name());
    }

    // ===================== helpers =====================

    private String confirmBooking(Long bookingId) {
        try {
            String url = bookingServiceUrl + "/internal/bookings/" + bookingId + "/confirm";
            ResponseEntity<Map> res = restTemplate.postForEntity(url, null, Map.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                Map<?, ?> data = (Map<?, ?>) res.getBody().get("data");
                return data != null ? (String) data.get("ticketCode") : null;
            }
        } catch (Exception e) {
            log.error("Failed to confirm booking {}: {}", bookingId, e.getMessage());
        }
        return null;
    }

    private void failBooking(Long bookingId) {
        try {
            String url = bookingServiceUrl + "/internal/bookings/" + bookingId + "/fail";
            restTemplate.postForEntity(url, null, Map.class);
        } catch (Exception e) {
            log.error("Failed to fail booking {}: {}", bookingId, e.getMessage());
        }
    }
}
