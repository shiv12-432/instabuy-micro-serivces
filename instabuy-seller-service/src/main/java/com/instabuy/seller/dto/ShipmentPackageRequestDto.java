package com.instabuy.seller.dto;

import lombok.Data;

@Data
public class ShipmentPackageRequestDto {
    private Integer orderLimit;
    private String packageName;
}
