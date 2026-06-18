package com.instabuy.product.client;

import com.instabuy.product.entity.Product;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
public class InventoryClient {

    private final RestTemplate restTemplate;
    private final String inventoryServiceUrl;

    public InventoryClient(RestTemplate restTemplate,
                           @Value("${inventory.service.url}") String inventoryServiceUrl) {
        this.restTemplate = restTemplate;
        this.inventoryServiceUrl = inventoryServiceUrl;
    }

    // Called when a seller creates a new product — syncs inventory entry
    public void syncProduct(Product product) {
        try {
            Map<String, Object> body = Map.of(
                    "productId", product.getId(),
                    "sku",       product.getSku(),
                    "name",      product.getName(),
                    "price",     product.getPrice(),
                    "stock",     product.getStock(),
                    "sellerId",  product.getSellerId()
            );
            ResponseEntity<Object> res = restTemplate.postForEntity(
                    inventoryServiceUrl + "/api/inventory/sync", body, Object.class);
            log.info("Inventory synced for productId={}, status={}", product.getId(), res.getStatusCode());
        } catch (Exception e) {
            log.error("Failed to sync inventory for productId={}: {}", product.getId(), e.getMessage());
        }
    }

    // Called when a seller deletes a product — removes inventory entry
    public void deleteProduct(Long productId) {
        try {
            restTemplate.delete(inventoryServiceUrl + "/api/inventory/product/" + productId);
            log.info("Inventory entry deleted for productId={}", productId);
        } catch (Exception e) {
            log.error("Failed to delete inventory for productId={}: {}", productId, e.getMessage());
        }
    }
}
