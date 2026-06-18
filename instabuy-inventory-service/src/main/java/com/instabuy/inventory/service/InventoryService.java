package com.instabuy.inventory.service;

import com.instabuy.inventory.constants.AppConstants;
import com.instabuy.inventory.dto.StockRequest;
import com.instabuy.inventory.dto.StockResponse;
import com.instabuy.inventory.entity.InventoryItem;
import com.instabuy.inventory.mapper.InventoryMapper;
import com.instabuy.inventory.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMapper inventoryMapper;

    public List<InventoryItem> getAll() {
        return inventoryRepository.findAll();
    }

    public InventoryItem getByProductId(Long productId) {
        return inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new IllegalArgumentException(AppConstants.INVENTORY_NOT_FOUND + productId));
    }

    @Transactional
    public InventoryItem syncItem(InventoryItem incoming) {
        // update existing entry if found, otherwise create new one
        return inventoryRepository.findByProductId(incoming.getProductId())
                .map(existing -> {
                    existing.setSku(incoming.getSku());
                    existing.setName(incoming.getName());
                    existing.setPrice(incoming.getPrice());
                    existing.setStock(incoming.getStock());
                    existing.setSellerId(incoming.getSellerId());
                    log.info("Inventory updated for productId={}", incoming.getProductId());
                    return inventoryRepository.save(existing);
                })
                .orElseGet(() -> {
                    log.info("Inventory created for productId={}", incoming.getProductId());
                    return inventoryRepository.save(incoming);
                });
    }

    @Transactional
    public void deleteByProductId(Long productId) {
        inventoryRepository.findByProductId(productId).ifPresent(item -> {
            inventoryRepository.delete(item);
            log.info("Inventory deleted for productId={}", productId);
        });
    }

    @Transactional
    public InventoryItem save(InventoryItem item) {
        return inventoryRepository.save(item);
    }

    @Transactional
    public StockResponse reserveStock(StockRequest request) {
        InventoryItem item = inventoryRepository.findByProductIdForUpdate(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException(AppConstants.INVENTORY_NOT_FOUND + request.getProductId()));

        if (item.getStock() < request.getQuantity()) {
            log.warn("Insufficient stock for productId={}: requested={}, available={}",
                    request.getProductId(), request.getQuantity(), item.getStock());
            return inventoryMapper.toStockResponse(item, false, AppConstants.INSUFFICIENT_STOCK + item.getSku());
        }

        item.setStock(item.getStock() - request.getQuantity());
        inventoryRepository.save(item);
        log.info("Stock reserved for productId={}: -{}", request.getProductId(), request.getQuantity());
        return inventoryMapper.toStockResponse(item, true, AppConstants.STOCK_RESERVED);
    }

    @Transactional
    public StockResponse releaseStock(StockRequest request) {
        InventoryItem item = inventoryRepository.findByProductId(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException(AppConstants.INVENTORY_NOT_FOUND + request.getProductId()));

        item.setStock(item.getStock() + request.getQuantity());
        inventoryRepository.save(item);
        log.info("Stock released (compensation) for productId={}: +{}", request.getProductId(), request.getQuantity());
        return inventoryMapper.toStockResponse(item, true, AppConstants.STOCK_RELEASED);
    }
}
