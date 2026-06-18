package com.instabuy.inventory.controller;

import com.instabuy.inventory.dto.StockRequest;
import com.instabuy.inventory.dto.StockResponse;
import com.instabuy.inventory.entity.InventoryItem;
import com.instabuy.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    public List<InventoryItem> getAll() {
        return inventoryService.getAll();
    }

    @GetMapping("/{productId}")
    public InventoryItem getByProductId(@PathVariable Long productId) {
        return inventoryService.getByProductId(productId);
    }

    @PostMapping
    public ResponseEntity<InventoryItem> create(@RequestBody InventoryItem item) {
        return ResponseEntity.ok(inventoryService.save(item));
    }

    // Called by product-service when a seller creates or updates a product
    @PostMapping("/sync")
    public ResponseEntity<InventoryItem> sync(@RequestBody Map<String, Object> body) {
        InventoryItem item = new InventoryItem();
        item.setProductId(Long.valueOf(body.get("productId").toString()));
        item.setSku(body.get("sku").toString());
        item.setName(body.get("name").toString());
        item.setPrice(new BigDecimal(body.get("price").toString()));
        item.setStock(Integer.valueOf(body.get("stock").toString()));
        item.setSellerId(Long.valueOf(body.get("sellerId").toString()));
        return ResponseEntity.ok(inventoryService.syncItem(item));
    }

    // Called by product-service when a seller deletes a product
    @DeleteMapping("/product/{productId}")
    public ResponseEntity<Void> deleteByProductId(@PathVariable Long productId) {
        inventoryService.deleteByProductId(productId);
        return ResponseEntity.noContent().build();
    }

    // Called by order-service: deduct stock atomically
    @PostMapping("/reserve")
    public ResponseEntity<StockResponse> reserve(@Valid @RequestBody StockRequest request) {
        StockResponse response = inventoryService.reserveStock(request);
        return response.isAvailable() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    // Called by order-service on payment failure: restore stock (Saga compensation)
    @PostMapping("/release")
    public ResponseEntity<StockResponse> release(@Valid @RequestBody StockRequest request) {
        return ResponseEntity.ok(inventoryService.releaseStock(request));
    }
}
