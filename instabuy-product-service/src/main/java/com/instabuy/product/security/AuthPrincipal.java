package com.instabuy.product.security;

import com.instabuy.product.enums.UserRole;

public record AuthPrincipal(Long id, String email, UserRole role) {
    public boolean isSeller() { return role == UserRole.SELLER; }
    public boolean isAdmin()  { return role == UserRole.ADMIN;  }
}
