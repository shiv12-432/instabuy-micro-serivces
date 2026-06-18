package com.instabuy.payment.gateway;

public record GatewayResult(boolean success, String transactionId, String failureReason) {
    public static GatewayResult ok(String txId)      { return new GatewayResult(true,  txId,  null);   }
    public static GatewayResult fail(String reason)  { return new GatewayResult(false, null,  reason); }
}
