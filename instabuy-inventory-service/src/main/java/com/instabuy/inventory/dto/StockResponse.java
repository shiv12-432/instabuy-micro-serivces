package com.instabuy.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StockResponse {
    private boolean available;
    private String message;
    private Integer currentStock;
    private Long sellerId;
}
