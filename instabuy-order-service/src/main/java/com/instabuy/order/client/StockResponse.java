package com.instabuy.order.client;

import lombok.Data;

@Data
public class StockResponse {
    private boolean available;
    private String message;
    private Integer currentStock;
    private Long sellerId;
}
