package com.notification.controller;

import com.notification.dto.ApiResponse;
import com.notification.dto.SendEmailRequest;
import com.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("ok"));
    }

    @PostMapping("/notifications/email")
    public ResponseEntity<ApiResponse<Object>> sendEmail(@Valid @RequestBody SendEmailRequest request) {
        Object result = notificationService.sendEmail(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(ApiResponse.success(result));
    }

    @GetMapping("/notifications/{id}")
    public ResponseEntity<ApiResponse<Object>> getById(@PathVariable String id) {
        Object notification = notificationService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(notification));
    }
}
