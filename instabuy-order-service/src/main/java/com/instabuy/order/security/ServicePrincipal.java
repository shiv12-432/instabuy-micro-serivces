package com.instabuy.order.security;

/**
 * Holds the identity of the calling client (frontend user or internal service)
 * extracted from the Authorization / X-Service-Name header.
 */
public record ServicePrincipal(String serviceName) {

    public boolean isGateway() {
        return "api-gateway".equalsIgnoreCase(serviceName);
    }
}
