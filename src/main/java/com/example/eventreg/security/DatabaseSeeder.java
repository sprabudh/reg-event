package com.example.eventreg.security;

import com.example.eventreg.entity.Category;
import com.example.eventreg.repository.CategoryRepository;
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
    private final CategoryRepository categoryRepository;

    /**
     * Categories are admin-owned: an admin maintains the whole list. Hosts do
     * not get their own category workflow -- they pick the closest fit from
     * this same list when submitting an event, and "Other" is always present
     * so nothing is ever blocked by a missing category.
     */
    private static final String FALLBACK_CATEGORY = "Other";

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

        // Idempotent: only seeds when missing, so it never fights an admin who
        // renamed or removed it deliberately.
        if (categoryRepository.findAll().stream()
                .noneMatch(c -> FALLBACK_CATEGORY.equalsIgnoreCase(c.getName()))) {
            Category other = new Category();
            other.setName(FALLBACK_CATEGORY);
            categoryRepository.save(other);
            System.out.println("✅ Fallback category '" + FALLBACK_CATEGORY + "' generated!");
        }
    }
}