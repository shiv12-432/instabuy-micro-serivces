package com.instabuy.gateway.controller;

import com.instabuy.gateway.constants.AppConstants;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    @RequestMapping("/auth")
    public ResponseEntity<Map<String, String>> authFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service Unavailable", "message", AppConstants.AUTH_SERVICE_UNAVAILABLE));
    }

    @RequestMapping("/products")
    public ResponseEntity<Map<String, String>> productsFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service Unavailable", "message", AppConstants.PRODUCT_SERVICE_UNAVAILABLE));
    }

    @RequestMapping("/inventory")
    public ResponseEntity<Map<String, String>> inventoryFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service Unavailable", "message", AppConstants.INVENTORY_SERVICE_UNAVAILABLE));
    }

    @RequestMapping("/payments")
    public ResponseEntity<Map<String, String>> paymentsFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service Unavailable", "message", AppConstants.PAYMENT_SERVICE_UNAVAILABLE));
    }

    @RequestMapping("/orders")
    public ResponseEntity<Map<String, String>> ordersFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service Unavailable", "message", AppConstants.ORDER_SERVICE_UNAVAILABLE));
    }

    @RequestMapping("/seller")
    public ResponseEntity<Map<String, String>> sellerFallback() {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of("error", "Service Unavailable", "message", AppConstants.SELLER_SERVICE_UNAVAILABLE));
    }
}
