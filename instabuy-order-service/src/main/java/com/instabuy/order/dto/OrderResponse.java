package com.instabuy.order.dto;

import com.instabuy.order.enums.OrderStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class OrderResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Integer quantity;
    private String customerName;
    private Double totalAmount;
    private Long paymentId;
    private String paymentGateway;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime expectedDeliveryStart;
    private LocalDateTime expectedDeliveryEnd;
}
