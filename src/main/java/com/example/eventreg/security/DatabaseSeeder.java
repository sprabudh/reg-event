package com.example.eventreg.security;

import com.example.eventreg.user.Role;
import com.example.eventreg.user.User;
import com.example.eventreg.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if the master admin already exists so we don't duplicate it
        if (userRepository.findByEmail("admin@eventreg.com").isEmpty()) {
            User masterAdmin = User.builder()
                    .name("Master Admin")
                    .email("admin@eventreg.com")
                    .password(passwordEncoder.encode("admin123")) // Default password
                    .role(Role.ADMIN)
                    .build();

            userRepository.save(masterAdmin);
            System.out.println("✅ Master Admin account securely generated!");
        }
    }
}