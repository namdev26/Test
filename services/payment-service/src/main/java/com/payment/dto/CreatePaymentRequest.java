package com.payment.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreatePaymentRequest {

    @NotNull(message = "booking_id is required")
    @JsonAlias({"bookingId", "booking_id"})
    private Long bookingId;

    @NotNull(message = "amount is required")
    private Long amount;

    @NotBlank(message = "card_number is required")
    @JsonAlias({"cardNumber", "card_number"})
    private String cardNumber;

    @NotBlank(message = "card_expiry is required")
    @JsonAlias({"cardExpiry", "card_expiry"})
    private String cardExpiry;

    @NotBlank(message = "card_cvv is required")
    @JsonAlias({"cardCvv", "card_cvv"})
    private String cardCvv;

    @NotBlank(message = "card_holder is required")
    @JsonAlias({"cardHolder", "card_holder"})
    private String cardHolder;
}
