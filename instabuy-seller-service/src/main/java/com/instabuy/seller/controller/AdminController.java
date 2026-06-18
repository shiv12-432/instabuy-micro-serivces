package com.instabuy.seller.controller;

import com.instabuy.seller.entity.ShipmentPackageRequest;
import com.instabuy.seller.enums.ShipmentPackageStatus;
import com.instabuy.seller.security.AuthTokenService;
import com.instabuy.seller.service.ShipmentPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ShipmentPackageService shipmentPackageService;
    private final AuthTokenService authTokenService;

    @GetMapping("/shipment-packages")
    public List<ShipmentPackageRequest> getAllPackages(
            @RequestHeader("Authorization") String auth) {
        authTokenService.requireAdmin(auth);
        return shipmentPackageService.getAllRequests();
    }

    @PutMapping("/shipment-packages/{id}/status")
    public ResponseEntity<ShipmentPackageRequest> updateStatus(
            @PathVariable Long id,
            @RequestParam ShipmentPackageStatus status,
            @RequestHeader("Authorization") String auth) {
        authTokenService.requireAdmin(auth);
        return ResponseEntity.ok(shipmentPackageService.updateStatus(id, status));
    }
}
