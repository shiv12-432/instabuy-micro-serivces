package com.instabuy.auth.controller;

import com.instabuy.auth.dto.AuthRequest;
import com.instabuy.auth.dto.AuthResponse;
import com.instabuy.auth.security.AuthPrincipal;
import com.instabuy.auth.security.AuthTokenService;
import com.instabuy.auth.service.AuthService;
import com.instabuy.auth.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final EmailService emailService;
    private final AuthTokenService authTokenService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody AuthRequest request) {
        AuthResponse response = authService.register(request);
        emailService.sendWelcome(request.getEmail(), request.getName());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, String>> refresh(@RequestHeader("Authorization") String authorization) {
        AuthPrincipal p = authTokenService.requirePrincipal(authorization);
        return ResponseEntity.ok(Map.of("token", authTokenService.generateToken(p.id(), p.email(), p.role())));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody Map<String, String> body) {
        String email   = body.getOrDefault("email",   "").trim();
        String name    = body.getOrDefault("name",    "").trim();
        String purpose = body.getOrDefault("purpose", "OTP").trim();
        if (email.isEmpty()) return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
        emailService.sendOtp(email, name, purpose);
        return ResponseEntity.ok(Map.of("message", "OTP sent to " + email));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, String>> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "").trim();
        String otp   = body.getOrDefault("otp",   "").trim();
        if (emailService.verifyOtp(email, otp))
            return ResponseEntity.ok(Map.of("message", "verified"));
        return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
    }
}
