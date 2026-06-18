package com.instabuy.seller.enums;

public enum OrderStatus {
    PENDING, APPROVED, SHIPPED, DELIVERED, CANCELLED;

    public static OrderStatus normalize(OrderStatus s) { return s; }
}
