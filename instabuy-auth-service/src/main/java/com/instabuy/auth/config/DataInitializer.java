package com.instabuy.auth.config;

import com.instabuy.auth.entity.User;
import com.instabuy.auth.enums.UserRole;
import com.instabuy.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer {

    private final UserRepository userRepository;
    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void init() {
        userRepository.findByEmail("admin").ifPresentOrElse(
            u -> log.info("Admin user already exists"),
            () -> {
                User admin = new User();
                admin.setEmail("admin");
                admin.setName("Admin");
                admin.setPassword(encoder.encode("admin"));
                admin.setRole(UserRole.ADMIN);
                userRepository.save(admin);
                log.info("Default admin user created");
            }
        );
    }
}
