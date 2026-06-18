package com.instabuy.payment.gateway;

public interface PaymentGateway {
    String gatewayName();
    GatewayResult charge(double amountInRupees, String paymentMethodToken, String customerName);
}
