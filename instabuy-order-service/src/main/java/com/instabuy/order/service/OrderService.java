package com.instabuy.order.service;

import com.instabuy.order.client.InventoryClient;
import com.instabuy.order.client.PaymentClient;
import com.instabuy.order.client.PaymentResponse;
import com.instabuy.order.client.ProductClient;
import com.instabuy.order.client.StockResponse;
import com.instabuy.order.constants.AppConstants;
import com.instabuy.order.dto.OrderRequest;
import com.instabuy.order.dto.OrderResponse;
import com.instabuy.order.entity.Order;
import com.instabuy.order.enums.OrderStatus;
import com.instabuy.order.mapper.OrderMapper;
import com.instabuy.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final InventoryClient inventoryClient;
    private final PaymentClient paymentClient;
    private final ProductClient productClient;

    /**
     * Saga orchestration:
     * 1. Reserve stock   (inventory-service via REST)
     * 2. Process payment (payment-service via REST)
     * 3a. Payment OK   → persist order as PENDING
     * 3b. Payment FAIL → release stock (Saga compensation) → throw
     */
    @Transactional
    public OrderResponse placeOrder(OrderRequest request) {
        log.info("Placing order for customer={}, productId={}", request.getCustomerName(), request.getProductId());

        StockResponse stock = inventoryClient.reserveStock(request.getProductId(), request.getQuantity());
        if (stock == null || !stock.isAvailable()) {
            String reason = stock != null ? stock.getMessage() : AppConstants.INVENTORY_SERVICE_UNAVAILABLE;
            throw new IllegalStateException(AppConstants.STOCK_RESERVATION_FAILED + reason);
        }

        PaymentResponse payment = paymentClient.processPayment(
                request.getCustomerName(), request.getTotalAmount(),
                request.getPaymentGateway(), request.getPaymentMethodToken());

        if (payment == null || !payment.isSuccess()) {
            log.warn("Payment failed — releasing reserved stock for productId={}", request.getProductId());
            inventoryClient.releaseStock(request.getProductId(), request.getQuantity());
            String reason = payment != null ? payment.getMessage() : AppConstants.PAYMENT_SERVICE_UNAVAILABLE;
            throw new IllegalStateException(AppConstants.PAYMENT_FAILED + reason);
        }

        Order order = new Order();
        order.setProductId(request.getProductId());
        order.setQuantity(request.getQuantity());
        order.setCustomerName(request.getCustomerName());
        order.setTotalAmount(request.getTotalAmount());
        order.setPaymentId(payment.getPaymentId());
        order.setPaymentGateway(request.getPaymentGateway());
        order.setSellerId(stock.getSellerId() != null && stock.getSellerId() != 0L
                ? stock.getSellerId()
                : (request.getSellerId() != null ? request.getSellerId() : 0L));
        order.setStatus(OrderStatus.PENDING);
        Order saved = orderRepository.save(order);

        // sync stock reduction to product-service so product page shows correct stock
        productClient.reduceStock(request.getProductId(), request.getQuantity());

        log.info("Order {} created successfully, paymentId={}", saved.getId(), payment.getPaymentId());
        return orderMapper.toResponse(saved);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, OrderStatus newStatus) {
        Order order = getById(orderId);
        order.setStatus(newStatus);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId) {
        Order order = getById(orderId);
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.APPROVED)
            throw new IllegalStateException(AppConstants.ONLY_PENDING_APPROVED_CANCEL);

        inventoryClient.releaseStock(order.getProductId(), order.getQuantity());
        productClient.restoreStock(order.getProductId(), order.getQuantity());
        if (order.getPaymentId() != null)
            paymentClient.refundPayment(order.getPaymentId());

        order.setStatus(OrderStatus.CANCELLED);
        log.info("Order {} cancelled", orderId);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    public List<OrderResponse> getAll() {
        return orderRepository.findAll().stream().map(orderMapper::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getByCustomer(String customerName) {
        return orderRepository.findByCustomerNameIgnoreCase(customerName).stream()
                .map(orderMapper::toResponse).collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id) {
        return orderMapper.toResponse(getById(id));
    }

    public List<OrderResponse> getBySellerId(Long sellerId) {
        return orderRepository.findBySellerId(sellerId).stream()
                .map(orderMapper::toResponse).collect(Collectors.toList());
    }

    public List<OrderResponse> getByProductId(Long productId) {
        return orderRepository.findByProductId(productId).stream()
                .map(orderMapper::toResponse).collect(Collectors.toList());
    }

    public Map<String, Object> getSellerAnalytics(Long sellerId) {
        List<Order> orders = orderRepository.findBySellerId(sellerId);
        long totalOrders    = orders.size();
        long totalUnits     = orders.stream().mapToLong(Order::getQuantity).sum();
        double totalRevenue = orders.stream().mapToDouble(Order::getTotalAmount).sum();
        long pending   = orders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        long approved  = orders.stream().filter(o -> o.getStatus() == OrderStatus.APPROVED).count();
        long delivered = orders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();
        double commission = totalRevenue * 0.05;
        double earnings   = totalRevenue - commission;

        Map<String, Object> result = new HashMap<>();
        result.put("totalCustomerOrders",   totalOrders);
        result.put("totalUnitsSold",         totalUnits);
        result.put("totalRevenueGenerated",  BigDecimal.valueOf(totalRevenue));
        result.put("pendingOrders",          pending);
        result.put("approvedOrders",         approved);
        result.put("deliveredOrders",        delivered);
        result.put("sellerEarnings",         BigDecimal.valueOf(earnings));
        result.put("instabuyCommission",     BigDecimal.valueOf(commission));
        result.put("monthlySales",           List.of());
        return result;
    }

    private Order getById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(AppConstants.ORDER_NOT_FOUND + id));
    }
}
