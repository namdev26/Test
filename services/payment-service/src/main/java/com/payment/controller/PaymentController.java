package com.payment.controller;

import com.payment.dto.ApiResponse;
import com.payment.dto.CallbackRequest;
import com.payment.dto.CreatePaymentRequest;
import com.payment.model.Payment;
import com.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("ok"));
    }

    @PostMapping("/payments")
    public ResponseEntity<ApiResponse<Payment>> createPayment(
            @RequestHeader("Idempotency-Key") String idempotencyKey,
            @Valid @RequestBody CreatePaymentRequest request) {
        Payment payment = paymentService.createPayment(idempotencyKey, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(payment));
    }

    @GetMapping("/payments/{id}")
    public ResponseEntity<ApiResponse<Payment>> getPayment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPayment(id)));
    }

    @PostMapping("/payments/callback")
    public ResponseEntity<ApiResponse<Map<String, Object>>> callback(
            @Valid @RequestBody CallbackRequest request) {
        Map<String, Object> result = paymentService.handleCallback(request);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
