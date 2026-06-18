package com.instabuy.inventory.enums;

public enum StockOperationType {
    RESERVE,   // deduct stock when order is placed
    RELEASE    // restore stock on payment failure or cancellation
}
