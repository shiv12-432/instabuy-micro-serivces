package com.instabuy.payment.mapper;

import com.instabuy.payment.dto.PaymentResponse;
import com.instabuy.payment.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment payment, boolean success, String message, String transactionId) {
        return new PaymentResponse(success, message, payment.getId(), transactionId);
    }
}
