package com.instabuy.product.controller;

import com.instabuy.product.entity.Product;
import com.instabuy.product.security.AuthPrincipal;
import com.instabuy.product.security.AuthTokenService;
import com.instabuy.product.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final AuthTokenService authTokenService;

    @GetMapping
    public List<Product> list(@RequestHeader(value = "Authorization", required = false) String auth) {
        if (auth != null && !auth.isBlank()) {
            AuthPrincipal p = authTokenService.requirePrincipal(auth);
            if (p.isSeller()) return productService.getProductsBySeller(p.id());
        }
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) { return productService.getProductById(id); }

    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product product,
                                          @RequestHeader("Authorization") String auth) {
        AuthPrincipal seller = authTokenService.requireSeller(auth);
        return ResponseEntity.ok(productService.createSellerProduct(product, seller.id()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product,
                                          @RequestHeader("Authorization") String auth) {
        AuthPrincipal seller = authTokenService.requireSeller(auth);
        return ResponseEntity.ok(productService.updateSellerProduct(id, product, seller.id()));
    }

    @PutMapping("/{id}/stock")
    public Product updateStock(@PathVariable Long id, @RequestParam int stock,
                               @RequestHeader("Authorization") String auth) {
        AuthPrincipal seller = authTokenService.requireSeller(auth);
        return productService.updateSellerStock(id, stock, seller.id());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id,
                                       @RequestHeader("Authorization") String auth) {
        AuthPrincipal seller = authTokenService.requireSeller(auth);
        productService.deleteSellerProduct(id, seller.id());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reduce")
    public ResponseEntity<Void> reduceStock(@PathVariable Long id, @RequestParam int quantity) {
        productService.reduceStock(id, quantity);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restoreStock(@PathVariable Long id, @RequestParam int quantity) {
        productService.restoreStock(id, quantity);
        return ResponseEntity.ok().build();
    }
}
