package com.seat.dto;

import lombok.Data;

@Data
public class SeatDto {
    private Long   seatId;
    private String row;
    private Integer number;
    private String status;
}
