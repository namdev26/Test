package com.payment.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CallbackRequest {

    @NotBlank(message = "gateway_ref is required")
    @JsonAlias({"gatewayRef", "gateway_ref"})
    private String gatewayRef;

    @NotBlank(message = "status is required")
    private String status;

    @NotNull(message = "booking_id is required")
    @JsonAlias({"bookingId", "booking_id"})
    private Long bookingId;
}
