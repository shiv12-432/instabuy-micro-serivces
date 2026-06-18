package com.instabuy.seller.repository;

import com.instabuy.seller.entity.ShipmentPackageRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ShipmentPackageRequestRepository extends JpaRepository<ShipmentPackageRequest, Long> {
    List<ShipmentPackageRequest> findBySellerId(Long sellerId);
}
