package com.notification.dto;

import lombok.Data;

@Data
public class NotificationEvent {
    /** BOOKING_CONFIRMED | BOOKING_FAILED */
    private String type;
    private Long   bookingId;
    private String ticketCode;
    private String customerEmail;
    private Double amount;
}
