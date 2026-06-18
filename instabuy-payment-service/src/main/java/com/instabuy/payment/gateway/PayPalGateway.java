package com.instabuy.payment.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Simulates PayPal payment gateway.
 * Mimics real PayPal Orders API v2 behaviour:
 *   - Transaction IDs follow PayPal's "PAYID-" prefix format
 *   - 90% success / 10% decline rate to demonstrate fault-tolerance
 *   - Small processing delay simulates real network round-trip
 */
@Slf4j
@Component
public class PayPalGateway implements PaymentGateway {

    @Override
    public String gatewayName() { return "PAYPAL"; }

    @Override
    public GatewayResult charge(double amountInRupees, String paymentMethodToken, String customerName) {
        simulateProcessingDelay();

        if (Math.random() < 0.10) {
            log.warn("[PAYPAL-SIM] Payment declined for customer: {}, amount: ₹{}", customerName, amountInRupees);
            return GatewayResult.fail("PayPal payment was declined. Please check your PayPal account balance.");
        }

        String transactionId = "PAYID-" + UUID.randomUUID().toString().replace("-", "").toUpperCase().substring(0, 20);
        log.info("[PAYPAL-SIM] Payment succeeded — txId: {}, customer: {}, amount: ₹{}", transactionId, customerName, amountInRupees);
        return GatewayResult.ok(transactionId);
    }

    private void simulateProcessingDelay() {
        try { Thread.sleep(400); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
