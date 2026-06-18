package com.instabuy.payment.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Simulates Stripe payment gateway.
 * Mimics real Stripe behaviour:
 *   - Transaction IDs follow Stripe's "pi_" prefix format
 *   - 90% success / 10% decline rate to demonstrate fault-tolerance
 *   - Small processing delay simulates real network round-trip
 */
@Slf4j
@Component
public class StripeGateway implements PaymentGateway {

    @Override
    public String gatewayName() { return "STRIPE"; }

    @Override
    public GatewayResult charge(double amountInRupees, String paymentMethodToken, String customerName) {
        simulateProcessingDelay();

        if (Math.random() < 0.10) {
            log.warn("[STRIPE-SIM] Card declined for customer: {}, amount: ₹{}", customerName, amountInRupees);
            return GatewayResult.fail("Your card was declined. Please try a different payment method.");
        }

        String transactionId = "pi_" + UUID.randomUUID().toString().replace("-", "").substring(0, 24);
        log.info("[STRIPE-SIM] Charge succeeded — txId: {}, customer: {}, amount: ₹{}", transactionId, customerName, amountInRupees);
        return GatewayResult.ok(transactionId);
    }

    private void simulateProcessingDelay() {
        try { Thread.sleep(300); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}
