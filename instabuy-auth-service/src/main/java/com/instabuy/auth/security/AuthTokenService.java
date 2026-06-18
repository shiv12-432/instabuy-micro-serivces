package com.instabuy.auth.security;

import com.instabuy.auth.enums.UserRole;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class AuthTokenService {

    private final Key signingKey;
    private final long expiryMs;
    private final long refreshExpiryMs;

    public AuthTokenService(@Value("${jwt.secret}") String secret,
                            @Value("${jwt.expiry-ms}") long expiryMs,
                            @Value("${jwt.refresh-expiry-ms}") long refreshExpiryMs) {
        this.signingKey     = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiryMs       = expiryMs;
        this.refreshExpiryMs = refreshExpiryMs;
    }

    public String generateToken(Long id, String email, UserRole role) {
        return build(id, email, role, expiryMs);
    }

    public String generateRefreshToken(Long id, String email, UserRole role) {
        return build(id, email, role, refreshExpiryMs);
    }

    public AuthPrincipal requirePrincipal(String authorizationHeader) {
        return decode(extract(authorizationHeader));
    }

    private String build(Long id, String email, UserRole role, long ttl) {
        Date now = new Date();
        return Jwts.builder()
                .setSubject(String.valueOf(id))
                .claim("email", email)
                .claim("role", role.name())
                .setIssuedAt(now)
                .setExpiration(new Date(now.getTime() + ttl))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    private AuthPrincipal decode(String token) {
        try {
            Claims claims = Jwts.parserBuilder().setSigningKey(signingKey).build()
                    .parseClaimsJws(token).getBody();
            return new AuthPrincipal(Long.valueOf(claims.getSubject()),
                    claims.get("email", String.class),
                    UserRole.valueOf(claims.get("role", String.class)));
        } catch (JwtException | IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid or expired token");
        }
    }

    private String extract(String header) {
        if (header == null || header.isBlank()) throw new IllegalArgumentException("Authorization header is required");
        return header.startsWith("Bearer ") ? header.substring(7).trim() : header.trim();
    }
}
