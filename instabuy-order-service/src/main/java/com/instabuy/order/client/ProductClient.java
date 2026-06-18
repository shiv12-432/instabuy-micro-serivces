package com.instabuy.order.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
public class ProductClient {

    private final RestTemplate restTemplate;
    private final String productServiceUrl;

    public ProductClient(RestTemplate restTemplate,
                         @Value("${product.service.url}") String productServiceUrl) {
        this.restTemplate = restTemplate;
        this.productServiceUrl = productServiceUrl;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> getProduct(Long productId) {
        try {
            return restTemplate.getForObject(
                    productServiceUrl + "/api/products/" + productId, Map.class);
        } catch (Exception e) {
            log.warn("Could not fetch product details for productId={}: {}", productId, e.getMessage());
            return null;
        }
    }

    public void reduceStock(Long productId, Integer quantity) {
        try {
            restTemplate.postForEntity(
                    productServiceUrl + "/api/products/" + productId + "/reduce?quantity=" + quantity,
                    null, Void.class);
            log.info("Product stock reduced for productId={} by {}", productId, quantity);
        } catch (Exception e) {
            log.error("Failed to reduce product stock for productId={}: {}", productId, e.getMessage());
        }
    }

    public void restoreStock(Long productId, Integer quantity) {
        try {
            restTemplate.postForEntity(
                    productServiceUrl + "/api/products/" + productId + "/restore?quantity=" + quantity,
                    null, Void.class);
            log.info("Product stock restored for productId={} by {}", productId, quantity);
        } catch (Exception e) {
            log.error("Failed to restore product stock for productId={}: {}", productId, e.getMessage());
        }
    }
}
