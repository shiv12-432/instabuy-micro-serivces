package com.instabuy.seller.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class SellerAnalyticsResponse {
    private long totalProductsListed;
    private long totalCustomerOrders;
    private long totalUnitsSold;
    private BigDecimal totalRevenueGenerated;
    private long pendingOrders;
    private long approvedOrders;
    private long deliveredOrders;
    private BigDecimal sellerEarnings;
    private BigDecimal instabuyCommission;
    private List<MonthlySales> monthlySales;

    @Data
    public static class MonthlySales {
        private String month;
        private long orders;
        private long units;
        private BigDecimal revenue;
    }
}
