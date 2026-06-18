package com.instabuy.order.client;

import lombok.Data;

@Data
public class StockRequest {
    private Long productId;
    private Integer quantity;

    public StockRequest(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }
}
