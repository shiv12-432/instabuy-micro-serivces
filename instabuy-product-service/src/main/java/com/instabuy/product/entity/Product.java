package com.instabuy.product.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data @NoArgsConstructor @AllArgsConstructor
@Entity @Table(name = "products")
public class Product {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer discountPercent = 0;

    @Column(nullable = false)
    private Integer stock;

    @Column(nullable = false, columnDefinition = "bigint default 0")
    private Long sellerId = 0L;

    @Column
    private String category;
}
