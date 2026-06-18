package com.instabuy.seller.controller;

import com.instabuy.seller.client.OrderServiceClient;
import com.instabuy.seller.client.ProductServiceClient;
import com.instabuy.seller.dto.SellerAnalyticsResponse;
import com.instabuy.seller.dto.SellerProfileDto;
import com.instabuy.seller.dto.ShipmentPackageRequestDto;
import com.instabuy.seller.entity.SellerProfile;
import com.instabuy.seller.entity.ShipmentPackageRequest;
import com.instabuy.seller.enums.ShipmentPackageStatus;
import com.instabuy.seller.security.AuthPrincipal;
import com.instabuy.seller.security.AuthTokenService;
import com.instabuy.seller.service.SellerAnalyticsService;
import com.instabuy.seller.service.SellerProfileService;
import com.instabuy.seller.service.ShipmentPackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerController {

    private final ShipmentPackageService shipmentPackageService;
    private final SellerAnalyticsService sellerAnalyticsService;
    private final SellerProfileService sellerProfileService;
    private final AuthTokenService authTokenService;
    private final ProductServiceClient productServiceClient;
    private final OrderServiceClient orderServiceClient;

    // ── Seller Profile ───────────────────────────────────────────────────────

    @PostMapping("/profile")
    public ResponseEntity<SellerProfile> createProfile(
            @RequestBody SellerProfileDto dto) {
        return ResponseEntity.ok(sellerProfileService.createProfile(dto));
    }

    @GetMapping("/profile")
    public ResponseEntity<SellerProfile> getProfile(
            @RequestHeader("Authorization") String auth) {
        AuthPrincipal seller = authTokenService.requireSeller(auth);
        return ResponseEntity.ok(sellerProfileService.getProfile(seller.id()));
    }

    @PutMapping("/profile")
    public ResponseEntity<SellerProfile> updateProfile(
            @RequestBody SellerProfileDto dto,
            @RequestHeader("Authorization") String auth) {
        AuthPrincipal seller = authTokenService.requireSeller(auth);
        return ResponseEntity.ok(sellerProfileService.updateProfile(seller.id(), dto));
    }

    @GetMapping("/profile/exists")
    public ResponseEntity<Map<String, Boolean>> profileExists(
            @RequestHeader("Authorization") String auth) {
        AuthPrincipal seller = authTokenService.requireSeller(auth);
        return ResponseEntity.ok(Map.of("exists", sellerProfileService.hasProfile(seller.id())));
    }

    // ── Proxy: seller products (from product-service) ────────────────────────

    @GetMapping("/products")
    public ResponseEntity<List<Map<String, Object>>> getSellerProducts(
            @RequestHeader("Authorization") String auth) {
        authTokenService.requireSeller(auth);
        return productServiceClient.getSellerProducts(auth);
    }

    // ── Proxy: seller orders (from order-service) ────────────────────────────

    @GetMapping("/orders")
    public ResponseEntity<List<Map<String, Object>>> getSellerOrders(
            @RequestHeader("Authorization") String auth) {
        AuthPrincipal seller = authTokenService.requireSeller(auth);
        return orderServiceClient.getSellerOrders(seller.id(), auth);
    }

    // ── Shipment Package Requests ────────────────────────────────────────────

    @GetMapping("/shipment-packages")
    public List<ShipmentPackageRequest> getMyPackages(
            @RequestHeader("Authorization") String auth) {
        AuthPrincipal seller = authTokenService.requireSeller(auth);
        return shipmentPackageService.getSellerRequests(seller.id());
    }

    @PostMapping("/shipment-packages")
    public ResponseEntity<ShipmentPackageRequest> requestPackage(
            @RequestBody ShipmentPackageRequestDto dto,
            @RequestHeader("Authorization") String auth) {
        AuthPrincipal seller = authTokenService.requireSeller(auth);
        return ResponseEntity.ok(shipmentPackageService.requestPackage(seller.id(), dto));
    }

    // ── Admin endpoints ──────────────────────────────────────────────────────

    @GetMapping("/admin/shipment-packages")
    public List<ShipmentPackageRequest> getAllPackages(
            @RequestHeader("Authorization") String auth) {
        authTokenService.requireAdmin(auth);
        return shipmentPackageService.getAllRequests();
    }

    @PutMapping("/admin/shipment-packages/{id}/status")
    public ResponseEntity<ShipmentPackageRequest> updatePackageStatus(
            @PathVariable Long id,
            @RequestParam ShipmentPackageStatus status,
            @RequestHeader("Authorization") String auth) {
        authTokenService.requireAdmin(auth);
        return ResponseEntity.ok(shipmentPackageService.updateStatus(id, status));
    }

    // ── Analytics ────────────────────────────────────────────────────────────

    @GetMapping("/analytics")
    public ResponseEntity<SellerAnalyticsResponse> getAnalytics(
            @RequestHeader("Authorization") String auth) {
        AuthPrincipal seller = authTokenService.requireSeller(auth);
        return ResponseEntity.ok(sellerAnalyticsService.getAnalytics(seller.id()));
    }
}
