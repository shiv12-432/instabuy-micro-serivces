package com.instabuy.order.controller;

import com.instabuy.order.dto.OrderRequest;
import com.instabuy.order.dto.OrderResponse;
import com.instabuy.order.enums.OrderStatus;
import com.instabuy.order.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest request) {
        return ResponseEntity.ok(orderService.placeOrder(request));
    }

    @GetMapping
    public List<OrderResponse> getAll(@RequestParam(required = false) String customerName) {
        return customerName != null ? orderService.getByCustomer(customerName) : orderService.getAll();
    }

    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @PutMapping("/{id}/status")
    public OrderResponse updateStatus(@PathVariable Long id, @RequestParam OrderStatus status) {
        return orderService.updateStatus(id, status);
    }

    // Seller accepts a PENDING order
    @PutMapping("/{id}/accept")
    public OrderResponse accept(@PathVariable Long id) {
        return orderService.updateStatus(id, OrderStatus.APPROVED);
    }

    // Admin ships an APPROVED order
    @PutMapping("/{id}/ship")
    public OrderResponse ship(@PathVariable Long id) {
        return orderService.updateStatus(id, OrderStatus.SHIPPED);
    }

    // Admin marks a SHIPPED order as delivered
    @PutMapping("/{id}/deliver")
    public OrderResponse deliver(@PathVariable Long id) {
        return orderService.updateStatus(id, OrderStatus.DELIVERED);
    }

    // Admin restores a CANCELLED order back to PENDING
    @PutMapping("/{id}/restore")
    public OrderResponse restore(@PathVariable Long id) {
        return orderService.updateStatus(id, OrderStatus.PENDING);
    }

    @PostMapping("/{id}/cancel")
    public OrderResponse cancel(@PathVariable Long id) {
        return orderService.cancelOrder(id);
    }

    @GetMapping("/seller/{sellerId}/analytics")
    public Map<String, Object> sellerAnalytics(@PathVariable Long sellerId) {
        return orderService.getSellerAnalytics(sellerId);
    }

    @GetMapping("/seller/{sellerId}/orders")
    public List<OrderResponse> sellerOrders(@PathVariable Long sellerId) {
        return orderService.getBySellerId(sellerId);
    }
}
