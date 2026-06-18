package com.instabuy.seller.service;

import com.instabuy.seller.client.OrderServiceClient;
import com.instabuy.seller.dto.SellerAnalyticsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SellerAnalyticsService {

    private final OrderServiceClient orderServiceClient;

    public SellerAnalyticsResponse getAnalytics(Long sellerId) {
        return orderServiceClient.getAnalytics(sellerId);
    }
}
