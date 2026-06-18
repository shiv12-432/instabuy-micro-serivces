package com.instabuy.order.security;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class ServiceAuthFilter {

    private static final String SERVICE_HEADER = "X-Service-Name";

    public ServicePrincipal extract(HttpServletRequest request) {
        String serviceName = request.getHeader(SERVICE_HEADER);
        return new ServicePrincipal(serviceName != null ? serviceName : "unknown");
    }
}
