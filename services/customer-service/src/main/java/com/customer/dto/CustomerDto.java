package com.customer.dto;

import com.customer.model.Customer;
import lombok.Data;

import java.time.Instant;

@Data
public class CustomerDto {
    private Long   id;
    private String name;
    private String email;
    private String phone;
    private Instant createdAt;

    public static CustomerDto from(Customer c) {
        CustomerDto dto = new CustomerDto();
        dto.setId(c.getId());
        dto.setName(c.getName());
        dto.setEmail(c.getEmail());
        dto.setPhone(c.getPhone());
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
