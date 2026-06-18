package com.instabuy.auth.service;

import com.instabuy.auth.constants.AppConstants;
import com.instabuy.auth.dto.AuthRequest;
import com.instabuy.auth.dto.AuthResponse;
import com.instabuy.auth.entity.User;
import com.instabuy.auth.enums.UserRole;
import com.instabuy.auth.repository.UserRepository;
import com.instabuy.auth.security.AuthTokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final EmailService emailService;
    private final AuthTokenService authTokenService;
    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public AuthResponse register(AuthRequest request) {
        if ("ADMIN".equalsIgnoreCase(request.getRole()))
            throw new IllegalArgumentException(AppConstants.ADMIN_CANNOT_REGISTER);

        if ("SELLER".equalsIgnoreCase(request.getRole())) {
            if (request.getOtp() == null || !emailService.isOtpValid(request.getEmail(), request.getOtp()))
                throw new IllegalArgumentException(AppConstants.OTP_REQUIRED_FOR_SELLER);
        }

        var existing = userRepository.findByEmail(request.getEmail());
        if (existing.isPresent()) {
            User user = existing.get();
            if ("SELLER".equalsIgnoreCase(request.getRole())) {
                if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
                    throw new IllegalArgumentException(AppConstants.INVALID_CREDENTIALS);
                user.setName(request.getName());
                user.setRole(UserRole.SELLER);
                return buildResponse(userRepository.save(user));
            }
            throw new IllegalArgumentException(AppConstants.EMAIL_ALREADY_REGISTERED);
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(parseRole(request.getRole()));
        log.info("User registered: {}", request.getEmail());
        return buildResponse(userRepository.save(user));
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException(AppConstants.INVALID_CREDENTIALS));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword()))
            throw new IllegalArgumentException(AppConstants.INVALID_CREDENTIALS);
        log.info("Login successful: {}", user.getEmail());
        return buildResponse(user);
    }

    private UserRole parseRole(String role) {
        try { return UserRole.valueOf(role.toUpperCase()); } catch (Exception e) { return UserRole.CUSTOMER; }
    }

    private AuthResponse buildResponse(User user) {
        String token        = authTokenService.generateToken(user.getId(), user.getEmail(), user.getRole());
        String refreshToken = authTokenService.generateRefreshToken(user.getId(), user.getEmail(), user.getRole());
        return new AuthResponse(user.getId(), token, refreshToken, user.getEmail(), user.getName(), user.getRole().name());
    }
}
