package com.instabuy.seller.service;

import com.instabuy.seller.constants.AppConstants;
import com.instabuy.seller.dto.ShipmentPackageRequestDto;
import com.instabuy.seller.entity.ShipmentPackageRequest;
import com.instabuy.seller.enums.ShipmentPackageStatus;
import com.instabuy.seller.repository.ShipmentPackageRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ShipmentPackageService {

    private static final Map<Integer, BigDecimal> PACKAGE_PRICES = Map.of(
            10, new BigDecimal("399"),
            25, new BigDecimal("799"),
            50, new BigDecimal("1499")
    );

    private final ShipmentPackageRequestRepository repository;

    public List<ShipmentPackageRequest> getSellerRequests(Long sellerId) {
        return repository.findBySellerId(sellerId);
    }

    public List<ShipmentPackageRequest> getAllRequests() {
        return repository.findAll();
    }

    public ShipmentPackageRequest requestPackage(Long sellerId, ShipmentPackageRequestDto dto) {
        Integer orderLimit = dto.getOrderLimit();
        BigDecimal price = PACKAGE_PRICES.get(orderLimit);
        if (price == null) throw new IllegalArgumentException(AppConstants.INVALID_PACKAGE);

        ShipmentPackageRequest req = new ShipmentPackageRequest();
        req.setSellerId(sellerId);
        req.setOrderLimit(orderLimit);
        req.setPrice(price);
        req.setPackageName(dto.getPackageName() == null || dto.getPackageName().isBlank()
                ? orderLimit + " orders shipment"
                : dto.getPackageName());
        req.setStatus(ShipmentPackageStatus.REQUESTED);
        return repository.save(req);
    }

    public ShipmentPackageRequest updateStatus(Long id, ShipmentPackageStatus status) {
        ShipmentPackageRequest req = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(AppConstants.SHIPMENT_NOT_FOUND + id));
        if (status != ShipmentPackageStatus.APPROVED && status != ShipmentPackageStatus.REJECTED)
            throw new IllegalArgumentException(AppConstants.ADMIN_ONLY_APPROVE_REJECT);
        req.setStatus(status);
        req.setReviewedAt(LocalDateTime.now());
        return repository.save(req);
    }
}
