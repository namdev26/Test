package com.booking.service;

import com.booking.dto.CreateBookingRequest;
import com.booking.dto.TicketDto;
import com.booking.exception.InvalidStateException;
import com.booking.exception.ResourceNotFoundException;
import com.booking.model.Booking;
import com.booking.model.BookingTicket;
import com.booking.repository.BookingRepository;
import com.booking.repository.BookingTicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Year;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository        bookingRepository;
    private final BookingTicketRepository  ticketRepository;
    private final RestTemplate             restTemplate;

    @Value("${customer.service.url}")
    private String customerServiceUrl;

    @Value("${seat.service.url}")
    private String seatServiceUrl;

    /** In-memory idempotency store */
    private final Map<String, Object> idempotencyStore = new ConcurrentHashMap<>();

    @Transactional
    public Object createBooking(String idempotencyKey, CreateBookingRequest req) {
        if (idempotencyStore.containsKey(idempotencyKey)) {
            log.info("Idempotent request: {}", idempotencyKey);
            return idempotencyStore.get(idempotencyKey);
        }

        // 1. Find or create customer
        Long customerId = resolveCustomer(req.getCustomer());

        // 2. Create booking record
        long pricePerSeat = 95000L;
        Booking booking = Booking.builder()
                .showtimeId(req.getShowtimeId())
                .customerId(customerId)
                .seatIds(req.getSeatIds())
                .totalAmount(req.getSeatIds().size() * pricePerSeat)
                .build();
        Booking saved = bookingRepository.save(booking);

        // 3. Hold each seat
        for (Long seatId : req.getSeatIds()) {
            holdSeat(req.getShowtimeId(), seatId, saved.getBookingId());
        }

        Map<String, Object> result = toMap(saved);
        idempotencyStore.put(idempotencyKey, result);
        log.info("Booking created: id={} customer={}", saved.getBookingId(), customerId);
        return result;
    }

    public Booking getBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found: " + id));
    }

    @Transactional
    public Booking cancelBooking(Long id) {
        Booking booking = getBooking(id);
        if (booking.getStatus() == Booking.BookingStatus.CONFIRMED) {
            throw new InvalidStateException("Confirmed booking cannot be cancelled");
        }
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        bookingRepository.save(booking);
        releaseSeats(booking);
        return booking;
    }

    public TicketDto getTicket(Long bookingId) {
        BookingTicket ticket = ticketRepository.findByBookingBookingId(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found for booking: " + bookingId));
        return toTicketDto(ticket);
    }

    /** Called internally by payment-service on SUCCESS */
    @Transactional
    public TicketDto confirmBooking(Long bookingId) {
        Booking booking = getBooking(bookingId);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // Mark seats SOLD
        markSeatsSold(booking);

        // Issue ticket
        String code = "MOV-" + Year.now().getValue() + "-" + bookingId;
        BookingTicket ticket = BookingTicket.builder()
                .booking(booking)
                .ticketCode(code)
                .qrData("https://tickets.example.com/verify/" + code)
                .build();
        ticketRepository.save(ticket);
        log.info("Booking {} confirmed, ticket issued: {}", bookingId, code);
        return toTicketDto(ticket);
    }

    /** Called internally by payment-service on FAILED */
    @Transactional
    public void failBooking(Long bookingId) {
        Booking booking = getBooking(bookingId);
        booking.setStatus(Booking.BookingStatus.FAILED);
        bookingRepository.save(booking);
        releaseSeats(booking);
        log.info("Booking {} failed, seats released", bookingId);
    }

    // ===================== helpers =====================

    private Long resolveCustomer(CreateBookingRequest.CustomerInfo info) {
        try {
            String url = customerServiceUrl + "/customers/by-email?email=" + info.getEmail();
            ResponseEntity<Map> res = restTemplate.getForEntity(url, Map.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                Map<?, ?> data = (Map<?, ?>) res.getBody().get("data");
                return ((Number) data.get("id")).longValue();
            }
        } catch (Exception ignored) {}

        // Create new customer
        try {
            Map<String, String> body = new HashMap<>();
            body.put("name", info.getName());
            body.put("email", info.getEmail());
            body.put("phone", info.getPhone());
            HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, jsonHeaders());
            ResponseEntity<Map> res = restTemplate.postForEntity(
                    customerServiceUrl + "/customers", entity, Map.class);
            Map<?, ?> data = (Map<?, ?>) res.getBody().get("data");
            return ((Number) data.get("id")).longValue();
        } catch (Exception e) {
            log.error("Failed to resolve customer", e);
            throw new RuntimeException("Customer service unavailable");
        }
    }

    private void holdSeat(Long showtimeId, Long seatId, Long bookingId) {
        try {
            // seat-service uses SNAKE_CASE jackson → must send booking_id
            Map<String, Object> body = new HashMap<>();
            body.put("booking_id", bookingId);
            body.put("ttl_seconds", 180);
            String url = seatServiceUrl + "/showtimes/" + showtimeId + "/seats/" + seatId + "/hold";
            restTemplate.postForEntity(url, new HttpEntity<>(body, jsonHeaders()), Map.class);
        } catch (Exception e) {
            log.error("Failed to hold seat {}: {}", seatId, e.getMessage());
            throw new RuntimeException("Seat " + seatId + " is not available");
        }
    }

    private void releaseSeats(Booking booking) {
        for (Long seatId : booking.getSeatIds()) {
            try {
                String url = seatServiceUrl + "/showtimes/" + booking.getShowtimeId()
                        + "/seats/" + seatId + "/release";
                restTemplate.postForEntity(url, new HttpEntity<>(null, jsonHeaders()), Map.class);
            } catch (Exception e) {
                log.warn("Failed to release seat {}: {}", seatId, e.getMessage());
            }
        }
    }

    private void markSeatsSold(Booking booking) {
        for (Long seatId : booking.getSeatIds()) {
            try {
                String url = seatServiceUrl + "/showtimes/" + booking.getShowtimeId()
                        + "/seats/" + seatId + "/sold";
                restTemplate.postForEntity(url, new HttpEntity<>(null, jsonHeaders()), Map.class);
            } catch (Exception e) {
                log.warn("Failed to mark seat {} sold: {}", seatId, e.getMessage());
            }
        }
    }

    private HttpHeaders jsonHeaders() {
        HttpHeaders h = new HttpHeaders();
        h.setContentType(MediaType.APPLICATION_JSON);
        return h;
    }

    private Map<String, Object> toMap(Booking b) {
        Map<String, Object> m = new HashMap<>();
        m.put("booking_id", b.getBookingId());
        m.put("showtime_id", b.getShowtimeId());
        m.put("customer_id", b.getCustomerId());
        m.put("seat_ids", b.getSeatIds());
        m.put("status", b.getStatus().name());
        m.put("total_amount", b.getTotalAmount());
        return m;
    }

    private TicketDto toTicketDto(BookingTicket t) {
        TicketDto dto = new TicketDto();
        dto.setTicketId(t.getTicketId());
        dto.setBookingId(t.getBooking().getBookingId());
        dto.setTicketCode(t.getTicketCode());
        dto.setQrData(t.getQrData());
        return dto;
    }
}
