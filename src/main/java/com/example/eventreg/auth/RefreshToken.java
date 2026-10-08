package com.example.eventreg.auth;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Server-side record of an issued refresh token.
 *
 * Why a table at all: a bare JWT cannot be revoked before its own expiry, so
 * "log out" could not actually end a session. Storing a hash of the refresh
 * token gives logout and rotation real effect.
 *
 * Only the SHA-256 hash is persisted, never the token itself, so a leaked
 * database dump cannot be replayed as a live session.
 */
@Entity
@Table(name = "refresh_tokens", indexes = {
        @Index(name = "idx_refresh_token_hash", columnList = "token_hash", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Hex-encoded SHA-256 of the refresh token. Unique, so lookup is a single hit. */
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    /** Owner of the session. The email is the username everywhere else in this app. */
    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "issued_at", nullable = false)
    private Instant issuedAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    /**
     * Set when the token is rotated or the user logs out. Kept as a row rather
     * than deleted so a replayed old token is recognisably revoked instead of
     * looking like a token that never existed.
     */
    @Column(nullable = false)
    private boolean revoked;

    /** True only when revoked AND past expiry: the two cleanup conditions differ. */
    public boolean isUsable(Instant now) {
        return !revoked && expiresAt.isAfter(now);
    }
}
