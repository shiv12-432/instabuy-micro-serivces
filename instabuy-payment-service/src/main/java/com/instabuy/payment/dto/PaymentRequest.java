package com.instabuy.payment.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequest {

    @NotBlank
    private String customerName;

    @NotNull
    @Min(1)
    private Double amount;

    // STRIPE or PAYPAL
    @NotBlank
    private String gateway;

    // For Stripe: the payment method token from frontend
    private String paymentMethodToken;
}
