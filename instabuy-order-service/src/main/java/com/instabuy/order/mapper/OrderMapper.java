package com.instabuy.order.mapper;

import com.instabuy.order.client.ProductClient;
import com.instabuy.order.dto.OrderResponse;
import com.instabuy.order.entity.Order;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class OrderMapper {

    private final ProductClient productClient;

    public OrderResponse toResponse(Order order) {
        OrderResponse r = new OrderResponse();
        r.setId(order.getId());
        r.setProductId(order.getProductId());
        r.setQuantity(order.getQuantity());
        r.setCustomerName(order.getCustomerName());
        r.setTotalAmount(order.getTotalAmount());
        r.setPaymentId(order.getPaymentId());
        r.setPaymentGateway(order.getPaymentGateway());
        r.setStatus(order.getStatus());
        r.setCreatedAt(order.getCreatedAt());
        if (order.getCreatedAt() != null) {
            r.setExpectedDeliveryStart(order.getCreatedAt().plusDays(3));
            r.setExpectedDeliveryEnd(order.getCreatedAt().plusDays(6));
        }
        // fetch product name and SKU from product-service
        Map<String, Object> product = productClient.getProduct(order.getProductId());
        if (product != null) {
            r.setProductName(product.get("name") != null ? product.get("name").toString() : null);
            r.setProductSku(product.get("sku") != null ? product.get("sku").toString() : null);
        }
        return r;
    }
}
