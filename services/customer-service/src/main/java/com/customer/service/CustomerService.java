package com.customer.service;

import com.customer.dto.CreateCustomerRequest;
import com.customer.dto.CustomerDto;
import com.customer.exception.DuplicateEmailException;
import com.customer.exception.ResourceNotFoundException;
import com.customer.model.Customer;
import com.customer.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional
    public CustomerDto createCustomer(CreateCustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException(request.getEmail());
        }
        Customer customer = Customer.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .build();
        Customer saved = customerRepository.save(customer);
        log.info("Customer created: id={} email={}", saved.getId(), saved.getEmail());
        return CustomerDto.from(saved);
    }

    public CustomerDto findById(Long id) {
        return customerRepository.findById(id)
                .map(CustomerDto::from)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
    }

    public CustomerDto findByEmail(String email) {
        return customerRepository.findByEmail(email)
                .map(CustomerDto::from)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));
    }
}
