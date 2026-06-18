package com.instabuy.payment.controller;

import com.instabuy.payment.dto.PaymentRequest;
import com.instabuy.payment.dto.PaymentResponse;
import com.instabuy.payment.entity.Payment;
import com.instabuy.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<PaymentResponse> refund(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.refundPayment(id));
    }

    @GetMapping
    public List<Payment> getAll() { return paymentService.getAll(); }

    @GetMapping("/{id}")
    public Payment getById(@PathVariable Long id) { return paymentService.getById(id); }
}
