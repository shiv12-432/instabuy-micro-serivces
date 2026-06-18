package com.instabuy.product.security;

import com.instabuy.product.enums.UserRole;
import io.jsonwebtoken.*;
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
            return new AuthPrincipal(Long.valueOf(claims.getSubject()),
                    claims.get("email", String.class),
                    UserRole.valueOf(claims.get("role", String.class)));
        } catch (Exception e) { throw new IllegalArgumentException("Invalid or expired token"); }
    }

    public AuthPrincipal requireSeller(String header) {
        AuthPrincipal p = requirePrincipal(header);
        if (!p.isSeller()) throw new IllegalArgumentException("Seller access required");
        return p;
    }
}
