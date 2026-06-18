package com.instabuy.payment.security;

/**
 * Holds the identity of the calling service extracted from the
 * X-Service-Name header. Used for inter-service request tracing.
 */
public record ServicePrincipal(String serviceName) {

    public boolean isOrderService() {
        return "order-service".equalsIgnoreCase(serviceName);
    }
}
