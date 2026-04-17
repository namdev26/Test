package com.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

@Data
public class SendEmailRequest {

    @NotBlank(message = "to is required")
    @Email(message = "to must be a valid email")
    private String to;

    @NotBlank(message = "subject is required")
    private String subject;

    @NotBlank(message = "template is required")
    private String template;

    private Map<String, Object> data;
}
