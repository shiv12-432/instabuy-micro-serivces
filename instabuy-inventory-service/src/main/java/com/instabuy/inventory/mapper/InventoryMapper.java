package com.instabuy.inventory.mapper;

import com.instabuy.inventory.dto.StockResponse;
import com.instabuy.inventory.entity.InventoryItem;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    public StockResponse toStockResponse(InventoryItem item, boolean available, String message) {
        return new StockResponse(available, message, item.getStock(), item.getSellerId());
    }
}
