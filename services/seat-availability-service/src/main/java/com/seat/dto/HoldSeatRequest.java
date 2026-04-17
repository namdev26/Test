package com.seat.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HoldSeatRequest {
    @NotNull(message = "booking_id is required")
    @JsonAlias({"bookingId", "booking_id"})
    private Long bookingId;

    @JsonAlias({"ttlSeconds", "ttl_seconds"})
    private Integer ttlSeconds = 180;
}
