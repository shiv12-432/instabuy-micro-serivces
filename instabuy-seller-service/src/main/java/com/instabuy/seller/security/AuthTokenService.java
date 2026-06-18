package com.instabuy.seller.security;

import com.instabuy.seller.constants.AppConstants;
import com.instabuy.seller.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;

@Component
public class AuthTokenService {

    private final Key signingKey;

    public AuthTokenService(@Value("${jwt.secret}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public AuthPrincipal requirePrincipal(String header) {
        String token = header != null && header.startsWith("Bearer ") ? header.substring(7).trim() : header;
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(signingKey).build()
                    .parseClaimsJws(token).getBody();
            return new AuthPrincipal(
                    Long.valueOf(claims.getSubject()),
                    claims.get("email", String.class),
                    UserRole.valueOf(claims.get("role", String.class)));
        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException(AppConstants.INVALID_TOKEN);
        }
    }

    public AuthPrincipal requireSeller(String header) {
        AuthPrincipal p = requirePrincipal(header);
        if (!p.isSeller()) throw new IllegalArgumentException(AppConstants.SELLER_ACCESS_REQUIRED);
        return p;
    }

    public AuthPrincipal requireAdmin(String header) {
        AuthPrincipal p = requirePrincipal(header);
        if (!p.isAdmin()) throw new IllegalArgumentException(AppConstants.ADMIN_ACCESS_REQUIRED);
        return p;
    }
}
