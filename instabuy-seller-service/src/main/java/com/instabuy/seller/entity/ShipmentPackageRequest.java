package com.instabuy.seller.entity;

import com.instabuy.seller.enums.ShipmentPackageStatus;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @NoArgsConstructor
@Entity @Table(name = "shipment_package_requests")
public class ShipmentPackageRequest {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private Long sellerId;
    @Column(nullable = false) private String packageName;
    @Column(nullable = false) private Integer orderLimit;
    @Column(nullable = false) private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ShipmentPackageStatus status = ShipmentPackageStatus.REQUESTED;

    @Column(nullable = false) private LocalDateTime requestedAt;
    private LocalDateTime reviewedAt;

    @PrePersist
    protected void onCreate() { requestedAt = requestedAt == null ? LocalDateTime.now() : requestedAt; }
}
