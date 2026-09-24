package com.example.eventreg.controller;

import com.example.eventreg.entity.Payment;
import com.example.eventreg.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class PaymentController {

    @Autowired
    private PaymentRepository paymentRepository;

    @GetMapping("/events/{eventId}/payments")
    public ResponseEntity<List<Payment>> getPaymentsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(paymentRepository.findByEventIdOrderByPaidAtDesc(eventId));
    }
}