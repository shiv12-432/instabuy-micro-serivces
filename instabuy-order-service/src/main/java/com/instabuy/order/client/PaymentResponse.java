package com.instabuy.order.client;

import lombok.Data;

@Data
public class PaymentResponse {
    private boolean success;
    private String message;
    private Long paymentId;
    private String gatewayTransactionId;
}
