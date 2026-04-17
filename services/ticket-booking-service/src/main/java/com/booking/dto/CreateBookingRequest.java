package com.booking.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateBookingRequest {

    @NotNull(message = "showtime_id is required")
    @JsonAlias({"showtimeId", "showtime_id"})
    private Long showtimeId;

    @NotEmpty(message = "seat_ids cannot be empty")
    @JsonAlias({"seatIds", "seat_ids"})
    private List<Long> seatIds;

    @NotNull(message = "customer is required")
    private CustomerInfo customer;

    @Data
    public static class CustomerInfo {
        private String name;
        private String email;
        private String phone;
    }
}
