package com.instabuy.order.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class PaymentClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public PaymentClient(RestTemplate restTemplate,
                         @Value("${payment.service.url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public PaymentResponse processPayment(String customerName, Double amount, String gateway, String paymentMethodToken) {
        PaymentRequest request = new PaymentRequest(customerName, amount, gateway, paymentMethodToken);
        ResponseEntity<PaymentResponse> response = restTemplate.postForEntity(
                baseUrl + "/api/payments", request, PaymentResponse.class);
        return response.getBody();
    }

    public void refundPayment(Long paymentId) {
        try {
            restTemplate.postForEntity(baseUrl + "/api/payments/" + paymentId + "/refund", null, PaymentResponse.class);
            log.info("Refund triggered for paymentId={}", paymentId);
        } catch (Exception e) {
            log.error("Failed to refund paymentId={}: {}", paymentId, e.getMessage());
        }
    }
}
