package com.example.eventreg.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Raised when a non-admin tries to edit a registration that is not their own,
 * tries to edit it after check-in, or tries to change their email.
 */
@ResponseStatus(HttpStatus.FORBIDDEN) // 403 Forbidden
public class NotYourRegistrationException extends RuntimeException {
    public NotYourRegistrationException(String message) {
        super(message);
    }
}
