package com.notification.service;

import com.notification.dto.NotificationEvent;
import com.notification.dto.SendEmailRequest;
import com.notification.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final RedisTemplate<String, Object> redisTemplate;

    private final Map<String, Object> notificationStore = new ConcurrentHashMap<>();
    private final AtomicInteger counter = new AtomicInteger(0);

    public Object sendEmail(SendEmailRequest request) {
        String id = generateId();
        Map<String, Object> notification = new HashMap<>();
        notification.put("notification_id", id);
        notification.put("to", request.getTo());
        notification.put("subject", request.getSubject());
        notification.put("template", request.getTemplate());
        notification.put("data", request.getData() != null ? request.getData() : Map.of());
        notification.put("status", "SENT");
        notification.put("sent_at", Instant.now().toString());

        notificationStore.put(id, notification);

        // Cache in Redis for quick lookups
        redisTemplate.opsForValue().set("notification:" + id, notification);

        log.info("[EMAIL SENT] id={} to={} subject={} template={}",
                id, request.getTo(), request.getSubject(), request.getTemplate());

        return Map.of("notification_id", id, "status", "QUEUED");
    }

    public void processEvent(NotificationEvent event) {
        // Deduplication via Redis
        String dedupKey = "notif:dedup:" + event.getType() + ":" + event.getBookingId();
        Boolean alreadyProcessed = redisTemplate.hasKey(dedupKey);
        if (Boolean.TRUE.equals(alreadyProcessed)) {
            log.warn("[DEDUP] Event already processed: {}", dedupKey);
            return;
        }

        redisTemplate.opsForValue().set(dedupKey, "1");

        boolean isSuccess = "BOOKING_CONFIRMED".equals(event.getType());
        SendEmailRequest req = new SendEmailRequest();
        req.setTo(event.getCustomerEmail() != null ? event.getCustomerEmail() : "customer@example.com");
        req.setSubject(isSuccess
                ? "Xác nhận đặt vé thành công - " + event.getTicketCode()
                : "Thông báo thanh toán thất bại - Đơn #" + event.getBookingId());
        req.setTemplate(isSuccess ? "ticket-success" : "booking-failes");
        req.setData(Map.of(
                "bookingId", event.getBookingId(),
                "ticketCode", event.getTicketCode() != null ? event.getTicketCode() : "",
                "amount", event.getAmount() != null ? event.getAmount() : 0
        ));

        sendEmail(req);
    }

    public Object findById(String id) {
        Object cached = redisTemplate.opsForValue().get("notification:" + id);
        if (cached != null) return cached;
        Object stored = notificationStore.get(id);
        if (stored == null) throw new ResourceNotFoundException("Notification not found: " + id);
        return stored;
    }

    private String generateId() {
        String datePart = Instant.now().toString().substring(0, 10).replace("-", "");
        return "ntf_" + datePart + "_" + String.format("%03d", counter.incrementAndGet());
    }
}
