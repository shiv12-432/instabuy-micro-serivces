package com.instabuy.product.service;

import com.instabuy.product.client.InventoryClient;
import com.instabuy.product.constants.AppConstants;
import com.instabuy.product.entity.Product;
import com.instabuy.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryClient inventoryClient;

    public List<Product> getAllProducts() { return productRepository.findAll(); }

    public List<Product> getProductsBySeller(Long sellerId) { return productRepository.findBySellerId(sellerId); }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(AppConstants.PRODUCT_NOT_FOUND + id));
    }

    @Transactional
    public Product createSellerProduct(Product product, Long sellerId) {
        product.setSellerId(sellerId);
        product.setDiscountPercent(normalizeDiscount(product.getDiscountPercent()));
        Product saved = productRepository.save(product);
        // sync to inventory-service so customers can purchase this product
        inventoryClient.syncProduct(saved);
        return saved;
    }

    @Transactional
    public Product updateSellerProduct(Long id, Product updated, Long sellerId) {
        Product product = getSellerOwned(id, sellerId);
        product.setSku(updated.getSku());
        product.setName(updated.getName());
        product.setDescription(updated.getDescription());
        product.setImageUrl(updated.getImageUrl());
        product.setPrice(updated.getPrice());
        product.setDiscountPercent(normalizeDiscount(updated.getDiscountPercent()));
        product.setStock(updated.getStock());
        product.setCategory(updated.getCategory());
        Product saved = productRepository.save(product);
        // sync updated stock/price to inventory-service
        inventoryClient.syncProduct(saved);
        return saved;
    }

    @Transactional
    public void deleteSellerProduct(Long id, Long sellerId) {
        Product product = getSellerOwned(id, sellerId);
        productRepository.delete(product);
        // remove from inventory-service
        inventoryClient.deleteProduct(id);
    }

    @Transactional
    public Product updateSellerStock(Long id, int stock, Long sellerId) {
        Product product = getSellerOwned(id, sellerId);
        product.setStock(stock);
        Product saved = productRepository.save(product);
        inventoryClient.syncProduct(saved);
        return saved;
    }

    @Transactional
    public void reduceStock(Long id, int quantity) {
        Product product = productRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new IllegalArgumentException(AppConstants.PRODUCT_NOT_FOUND + id));
        if (product.getStock() < quantity)
            throw new IllegalStateException(AppConstants.INSUFFICIENT_STOCK + product.getSku());
        product.setStock(product.getStock() - quantity);
        Product saved = productRepository.save(product);
        inventoryClient.syncProduct(saved);
    }

    @Transactional
    public void restoreStock(Long id, int quantity) {
        Product product = getProductById(id);
        product.setStock(product.getStock() + quantity);
        Product saved = productRepository.save(product);
        inventoryClient.syncProduct(saved);
    }

    private Product getSellerOwned(Long id, Long sellerId) {
        Product product = getProductById(id);
        if (!sellerId.equals(product.getSellerId()))
            throw new IllegalArgumentException(AppConstants.NOT_SELLER_PRODUCT);
        return product;
    }

    private int normalizeDiscount(Integer d) {
        if (d == null) return 0;
        return Math.max(0, Math.min(95, d));
    }
}
