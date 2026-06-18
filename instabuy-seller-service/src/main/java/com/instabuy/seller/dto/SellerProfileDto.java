package com.instabuy.seller.dto;

import lombok.Data;

@Data
public class SellerProfileDto {
    private Long userId;
    private String sellerName;
    private String storeName;
    private String gstNumber;
    private String phone;
    private String accountNumber;
    private String ifscCode;
    private String pickupAddress;
    private String email;
}
