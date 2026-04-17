package com.booking.dto;

import lombok.Data;

@Data
public class TicketDto {
    private Long   ticketId;
    private Long   bookingId;
    private String ticketCode;
    private String qrData;
}
