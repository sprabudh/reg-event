package com.example.eventreg.exception;

/**
 * The presented refresh token is unknown, expired, already rotated, or revoked
 * by a logout.
 *
 * Mapped to 401 so the client's interceptor can treat it as "this session is
 * over" and send the user to the login screen, instead of retrying forever.
 */
public class InvalidRefreshTokenException extends RuntimeException {
    public InvalidRefreshTokenException(String message) {
        super(message);
    }
}
