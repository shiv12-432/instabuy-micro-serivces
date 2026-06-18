package com.instabuy.seller.service;

import com.instabuy.seller.constants.AppConstants;
import com.instabuy.seller.dto.SellerProfileDto;
import com.instabuy.seller.entity.SellerProfile;
import com.instabuy.seller.repository.SellerProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SellerProfileService {

    private final SellerProfileRepository sellerProfileRepository;

    @Transactional
    public SellerProfile createProfile(SellerProfileDto dto) {
        // if profile already exists for this userId, update it
        SellerProfile profile = sellerProfileRepository.findByUserId(dto.getUserId())
                .orElse(new SellerProfile());

        profile.setUserId(dto.getUserId());
        profile.setSellerName(dto.getSellerName());
        profile.setStoreName(dto.getStoreName());
        profile.setGstNumber(dto.getGstNumber());
        profile.setPhone(dto.getPhone());
        profile.setAccountNumber(dto.getAccountNumber());
        profile.setIfscCode(dto.getIfscCode());
        profile.setPickupAddress(dto.getPickupAddress());
        profile.setEmail(dto.getEmail());

        SellerProfile saved = sellerProfileRepository.save(profile);
        log.info("Seller profile saved for userId={}", dto.getUserId());
        return saved;
    }

    public SellerProfile getProfile(Long userId) {
        return sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException(AppConstants.SELLER_PROFILE_NOT_FOUND + userId));
    }

    public boolean hasProfile(Long userId) {
        return sellerProfileRepository.existsByUserId(userId);
    }

    @Transactional
    public SellerProfile updateProfile(Long userId, SellerProfileDto dto) {
        SellerProfile profile = sellerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Seller profile not found for userId: " + userId));

        profile.setSellerName(dto.getSellerName());
        profile.setStoreName(dto.getStoreName());
        profile.setGstNumber(dto.getGstNumber());
        profile.setPhone(dto.getPhone());
        profile.setAccountNumber(dto.getAccountNumber());
        profile.setIfscCode(dto.getIfscCode());
        profile.setPickupAddress(dto.getPickupAddress());
        log.info("Seller profile updated for userId={}", userId);
        return sellerProfileRepository.save(profile);
    }
}
