package com.instabuy.order.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderRequest {

    @NotNull
    private Long productId;

    @NotNull
    @Min(1)
    private Integer quantity;

    @NotBlank
    private String customerName;

    @NotNull
    @Min(1)
    private Double totalAmount;

    // STRIPE or PAYPAL
    @NotBlank
    private String paymentGateway;

    // Payment method token from frontend
    private String paymentMethodToken;

    // sellerId passed from frontend (from product data)
    private Long sellerId;
}
