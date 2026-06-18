package com.instabuy.payment.service;

import com.instabuy.payment.constants.AppConstants;
import com.instabuy.payment.dto.PaymentRequest;
import com.instabuy.payment.dto.PaymentResponse;
import com.instabuy.payment.entity.Payment;
import com.instabuy.payment.enums.PaymentStatus;
import com.instabuy.payment.gateway.GatewayResult;
import com.instabuy.payment.gateway.PaymentGateway;
import com.instabuy.payment.mapper.PaymentMapper;
import com.instabuy.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final List<PaymentGateway> gateways;

    private Map<String, PaymentGateway> gatewayMap() {
        return gateways.stream()
                .collect(Collectors.toMap(g -> g.gatewayName().toUpperCase(), Function.identity()));
    }

    @Transactional
    public PaymentResponse processPayment(PaymentRequest request) {
        String gatewayKey = request.getGateway().toUpperCase();
        PaymentGateway gateway = gatewayMap().get(gatewayKey);
        if (gateway == null)
            throw new IllegalArgumentException(AppConstants.UNSUPPORTED_GATEWAY + request.getGateway());

        Payment payment = new Payment();
        payment.setCustomerName(request.getCustomerName());
        payment.setAmount(request.getAmount());
        payment.setGateway(gatewayKey);
        payment.setStatus(PaymentStatus.PENDING);
        payment = paymentRepository.save(payment);

        GatewayResult result = gateway.charge(request.getAmount(), request.getPaymentMethodToken(), request.getCustomerName());

        payment.setStatus(result.success() ? PaymentStatus.SUCCESS : PaymentStatus.FAILED);
        payment.setGatewayTransactionId(result.transactionId());
        payment.setFailureReason(result.failureReason());
        paymentRepository.save(payment);

        log.info("Payment {} via {}: {}", payment.getId(), gatewayKey, payment.getStatus());
        String message = result.success() ? AppConstants.PAYMENT_SUCCESSFUL : AppConstants.PAYMENT_FAILED + result.failureReason();
        return paymentMapper.toResponse(payment, result.success(), message, result.transactionId());
    }

    @Transactional
    public PaymentResponse refundPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(AppConstants.PAYMENT_NOT_FOUND + paymentId));
        if (payment.getStatus() != PaymentStatus.SUCCESS)
            throw new IllegalStateException(AppConstants.ONLY_SUCCESS_REFUNDABLE);

        String refundId = "REF-" + payment.getGateway() + "-" + payment.getId() + "-" + System.currentTimeMillis();
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setGatewayTransactionId(refundId);
        paymentRepository.save(payment);
        log.info("[{}-SIM] Refund processed — refundId: {}, paymentId: {}", payment.getGateway(), refundId, paymentId);
        return paymentMapper.toResponse(payment, true, AppConstants.REFUND_SUCCESSFUL, refundId);
    }

    public List<Payment> getAll() { return paymentRepository.findAll(); }

    public Payment getById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(AppConstants.PAYMENT_NOT_FOUND + id));
    }
}
