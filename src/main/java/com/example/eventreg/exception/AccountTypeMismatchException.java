package com.example.eventreg.exception;

/**
 * Credentials were valid but the account is not the kind of account the caller
 * asked for -- e.g. "Host" selected at login for an attendee account.
 *
 * Returned as 401 rather than 403 because from the caller's point of view the
 * chosen identity is not usable, not that they lack permission.
 */
public class AccountTypeMismatchException extends RuntimeException {
    public AccountTypeMismatchException(String message) {
        super(message);
    }
}