package com.instabuy.order.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
public class InventoryClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public InventoryClient(RestTemplate restTemplate,
                           @Value("${inventory.service.url}") String baseUrl) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
    }

    public StockResponse reserveStock(Long productId, Integer quantity) {
        StockRequest request = new StockRequest(productId, quantity);
        ResponseEntity<StockResponse> response = restTemplate.postForEntity(
                baseUrl + "/api/inventory/reserve", request, StockResponse.class);
        return response.getBody();
    }

    public void releaseStock(Long productId, Integer quantity) {
        StockRequest request = new StockRequest(productId, quantity);
        try {
            restTemplate.postForEntity(baseUrl + "/api/inventory/release", request, StockResponse.class);
            log.info("Stock released (Saga compensation) for productId={}", productId);
        } catch (Exception e) {
            log.error("Failed to release stock for productId={}: {}", productId, e.getMessage());
        }
    }
}
