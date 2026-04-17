package com.payment.dto;

import lombok.Data;

@Data
public class NotificationEvent {
    /** BOOKING_CONFIRMED | BOOKING_FAILED */
    private String type;
    private Long   bookingId;
    private String ticketCode;
    private String customerEmail;
    private Double amount;

    public static NotificationEvent success(Long bookingId, String ticketCode, Double amount) {
        NotificationEvent e = new NotificationEvent();
        e.setType("BOOKING_CONFIRMED");
        e.setBookingId(bookingId);
        e.setTicketCode(ticketCode);
        e.setAmount(amount);
        e.setCustomerEmail("customer@example.com");
        return e;
    }

    public static NotificationEvent failed(Long bookingId, Double amount) {
        NotificationEvent e = new NotificationEvent();
        e.setType("BOOKING_FAILED");
        e.setBookingId(bookingId);
        e.setAmount(amount);
        e.setCustomerEmail("customer@example.com");
        return e;
    }
}
