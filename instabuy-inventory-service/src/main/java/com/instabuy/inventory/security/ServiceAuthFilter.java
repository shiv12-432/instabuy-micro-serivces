package com.instabuy.inventory.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class ServiceAuthFilter {

    private static final String SERVICE_HEADER = "X-Service-Name";

    /**
     * Extracts the calling service identity from the request header.
     * In production this would validate a shared secret or JWT.
     */
    public ServicePrincipal extract(HttpServletRequest request) {
        String serviceName = request.getHeader(SERVICE_HEADER);
        return new ServicePrincipal(serviceName != null ? serviceName : "unknown");
    }
}
