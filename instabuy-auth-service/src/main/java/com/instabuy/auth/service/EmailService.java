package com.instabuy.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final EmailSender emailSender;

    private final Map<String, String> otpStore    = new ConcurrentHashMap<>();
    private final Map<String, Long>   otpExpiry   = new ConcurrentHashMap<>();
    private final Map<String, Long>   verifiedMap = new ConcurrentHashMap<>();
    private static final long OTP_VALIDITY_MS     = 5 * 60 * 1000L;
    private static final long VERIFIED_VALIDITY_MS = 15 * 60 * 1000L;

    public void sendOtp(String toEmail, String name, String purpose) {
        String otp = String.format("%06d", new Random().nextInt(1000000));
        otpStore.put(toEmail.toLowerCase(), otp);
        otpExpiry.put(toEmail.toLowerCase(), System.currentTimeMillis() + OTP_VALIDITY_MS);
        log.warn(">>> [{}] OTP for {} is: {}", purpose, toEmail, otp);

        String body = """
                <div style="font-family:Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
                  <div style="background:#1b2a4a;padding:24px 32px">
                    <h1 style="color:#fff;margin:0;font-size:1.4rem">Insta<span style="color:#f4a261">Buy</span></h1>
                  </div>
                  <div style="padding:32px">
                    <h2 style="margin:0 0 12px;color:#1e293b">Hi %s 👋</h2>
                    <p style="color:#64748b;margin:0 0 24px">Use the code below to verify your email. Valid for 5 minutes.</p>
                    <div style="background:#f1f5f9;border-radius:8px;padding:20px;text-align:center;letter-spacing:8px;font-size:2rem;font-weight:800;color:#1b2a4a">%s</div>
                  </div>
                </div>
                """.formatted(name.isBlank() ? "there" : name, otp);

        emailSender.sendHtml(toEmail, "InstaBuy — Your Verification Code", body);
    }

    public boolean verifyOtp(String email, String otp) {
        String key = email.toLowerCase();
        String stored = otpStore.get(key);
        Long expiry   = otpExpiry.get(key);
        boolean valid = stored != null && stored.equals(otp.trim())
                && expiry != null && System.currentTimeMillis() <= expiry;
        otpStore.remove(key);
        otpExpiry.remove(key);
        if (valid) verifiedMap.put(key, System.currentTimeMillis() + VERIFIED_VALIDITY_MS);
        return valid;
    }

    public boolean isOtpValid(String email, String otp) {
        String key = email.toLowerCase();
        // Accept if already verified via /verify-otp endpoint
        Long verifiedExpiry = verifiedMap.get(key);
        if (verifiedExpiry != null && System.currentTimeMillis() <= verifiedExpiry) {
            verifiedMap.remove(key);
            return true;
        }
        // Fallback: check live OTP store
        String stored = otpStore.get(key);
        Long expiry   = otpExpiry.get(key);
        return stored != null && stored.equals(otp.trim())
                && expiry != null && System.currentTimeMillis() <= expiry;
    }

    public void sendWelcome(String toEmail, String name) {
        String body = """
                <div style="font-family:Segoe UI,Arial,sans-serif;max-width:480px;margin:0 auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
                  <div style="background:linear-gradient(135deg,#1b2a4a,#243b6e);padding:32px;text-align:center">
                    <h1 style="color:#fff;margin:0 0 8px">Insta<span style="color:#f4a261">Buy</span></h1>
                  </div>
                  <div style="padding:32px">
                    <h2 style="margin:0 0 12px;color:#1e293b">Welcome aboard, %s! 🎊</h2>
                    <p style="color:#64748b;line-height:1.7;margin:0 0 20px">Your account has been created. Start shopping now!</p>
                  </div>
                </div>
                """.formatted(name.isBlank() ? "there" : name);
        emailSender.sendHtml(toEmail, "Welcome to InstaBuy! 🎉", body);
    }

    @Scheduled(fixedDelay = 600_000)
    public void cleanupExpiredOtps() {
        long now = System.currentTimeMillis();
        otpExpiry.entrySet().removeIf(e -> {
            if (e.getValue() < now) { otpStore.remove(e.getKey()); return true; }
            return false;
        });
        verifiedMap.entrySet().removeIf(e -> e.getValue() < now);
    }
}
