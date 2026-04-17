package com.customer.controller;

import com.customer.dto.ApiResponse;
import com.customer.dto.CreateCustomerRequest;
import com.customer.dto.CustomerDto;
import com.customer.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseEntity.ok(ApiResponse.success("ok"));
    }

    @PostMapping("/customers")
    public ResponseEntity<ApiResponse<CustomerDto>> createCustomer(
            @Valid @RequestBody CreateCustomerRequest request) {
        CustomerDto dto = customerService.createCustomer(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(dto));
    }

    @GetMapping("/customers/by-email")
    public ResponseEntity<ApiResponse<CustomerDto>> getByEmail(@RequestParam String email) {
        CustomerDto dto = customerService.findByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<ApiResponse<CustomerDto>> getById(@PathVariable Long id) {
        CustomerDto dto = customerService.findById(id);
        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
