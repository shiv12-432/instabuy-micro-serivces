package com.instabuy.seller.client;

import com.instabuy.seller.dto.SellerAnalyticsResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class OrderServiceClient {

    private final RestTemplate restTemplate;
    private final String orderServiceUrl;

    public OrderServiceClient(RestTemplate restTemplate,
                              @Value("${order.service.url}") String orderServiceUrl) {
        this.restTemplate = restTemplate;
        this.orderServiceUrl = orderServiceUrl;
    }

    public ResponseEntity<List<Map<String, Object>>> getSellerOrders(Long sellerId, String authHeader) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", authHeader);
            return restTemplate.exchange(
                    orderServiceUrl + "/api/orders/seller/" + sellerId + "/orders",
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    new ParameterizedTypeReference<>() {});
        } catch (Exception e) {
            log.error("Failed to fetch orders from order-service for sellerId={}: {}", sellerId, e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(List.of());
        }
    }

    @SuppressWarnings("unchecked")
    public SellerAnalyticsResponse getAnalytics(Long sellerId) {
        try {
            var response = restTemplate.exchange(
                    orderServiceUrl + "/api/orders/seller/" + sellerId + "/analytics",
                    HttpMethod.GET, null,
                    new ParameterizedTypeReference<Map<String, Object>>() {});

            if (response.getBody() == null) return emptyAnalytics();
            Map<String, Object> body = response.getBody();

            SellerAnalyticsResponse analytics = new SellerAnalyticsResponse();
            analytics.setTotalCustomerOrders(toLong(body.get("totalCustomerOrders")));
            analytics.setTotalUnitsSold(toLong(body.get("totalUnitsSold")));
            analytics.setTotalRevenueGenerated(toBigDecimal(body.get("totalRevenueGenerated")));
            analytics.setPendingOrders(toLong(body.get("pendingOrders")));
            analytics.setApprovedOrders(toLong(body.get("approvedOrders")));
            analytics.setDeliveredOrders(toLong(body.get("deliveredOrders")));
            analytics.setSellerEarnings(toBigDecimal(body.get("sellerEarnings")));
            analytics.setInstabuyCommission(toBigDecimal(body.get("instabuyCommission")));
            analytics.setMonthlySales(List.of());
            return analytics;
        } catch (Exception e) {
            log.error("Failed to fetch analytics from order-service for sellerId={}: {}", sellerId, e.getMessage());
            return emptyAnalytics();
        }
    }

    private SellerAnalyticsResponse emptyAnalytics() {
        SellerAnalyticsResponse r = new SellerAnalyticsResponse();
        r.setTotalCustomerOrders(0);
        r.setTotalUnitsSold(0);
        r.setTotalRevenueGenerated(BigDecimal.ZERO);
        r.setPendingOrders(0);
        r.setApprovedOrders(0);
        r.setDeliveredOrders(0);
        r.setSellerEarnings(BigDecimal.ZERO);
        r.setInstabuyCommission(BigDecimal.ZERO);
        r.setMonthlySales(List.of());
        return r;
    }

    private long toLong(Object val) {
        if (val == null) return 0L;
        return ((Number) val).longValue();
    }

    private BigDecimal toBigDecimal(Object val) {
        if (val == null) return BigDecimal.ZERO;
        return new BigDecimal(val.toString());
    }
}
