package com.example.eventreg.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    /** Sign-out: drop every live session for one user. */
    long deleteByUserEmailAndRevokedFalse(String userEmail);

    /**
     * Housekeeping. Rows whose refresh window has closed can never be used again,
     * so they are removed rather than accumulating. Expired-but-unrevoked rows
     * still go: an expired token is rejected either way, and keeping it would only
     * bloat the table.
     */
    @Modifying
    @Query("DELETE FROM RefreshToken t WHERE t.expiresAt < :now")
    int deleteExpired(Instant now);
}
