package com.instabuy.order.client;

import lombok.Data;

@Data
public class PaymentRequest {
    private String customerName;
    private Double amount;
    private String gateway;
    private String paymentMethodToken;

    public PaymentRequest(String customerName, Double amount, String gateway, String paymentMethodToken) {
        this.customerName = customerName;
        this.amount = amount;
        this.gateway = gateway;
        this.paymentMethodToken = paymentMethodToken;
    }
}
