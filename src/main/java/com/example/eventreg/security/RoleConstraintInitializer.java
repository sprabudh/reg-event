package com.example.eventreg.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

/**
 * Repairs the users.role CHECK constraint so it accepts the HOST role.
 *
 * Why this is needed: Hibernate generates a CHECK constraint for
 * @Enumerated(STRING) columns, and it DID create correct ones for the new
 * approval_status columns. But ddl-auto=update only manages constraints for
 * tables it creates -- it will not alter one that already exists. The
 * pre-existing
 *
 *   CHECK (role IN ('USER','ADMIN'))
 *
 * therefore survives every restart and silently rejects every HOST insert with
 * a constraint violation. This project has no Flyway/Liquibase, so rather than
 * introduce a migration framework for one statement we drop and recreate the
 * constraint on startup.
 *
 * Drop-then-add rather than a plain DROP: the database-level guarantee that
 * role is one of the three known values is worth keeping, and running it every
 * boot makes it idempotent even if Hibernate re-creates its own version first.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RoleConstraintInitializer implements CommandLineRunner {

    private final DataSource dataSource;

    @Override
    public void run(String... args) {
        String drop = "ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check";
        String add = "ALTER TABLE users ADD CONSTRAINT users_role_check "
                + "CHECK (role IS NULL OR role IN ('USER','ADMIN','HOST'))";

        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement()) {

            statement.execute(drop);
            statement.execute(add);

            log.info("users.role constraint reset to include the HOST role.");
        } catch (Exception ex) {
            // Never block startup on this. If it fails, the symptom is a clear
            // constraint violation on HOST signup, not a dead application.
            log.warn("Could not reset the users.role CHECK constraint: {}", ex.getMessage());
        }
    }
}