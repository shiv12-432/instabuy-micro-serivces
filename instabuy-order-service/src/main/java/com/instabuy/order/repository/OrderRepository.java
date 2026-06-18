package com.instabuy.order.repository;

import com.instabuy.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCustomerNameIgnoreCase(String customerName);
    List<Order> findBySellerId(Long sellerId);
    List<Order> findByProductId(Long productId);
}
