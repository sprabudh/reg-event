package com.example.eventreg.exception;

/**
 * Signed-in caller is not allowed to touch this specific resource.
 *
 * Distinct from a 404 by intent: it exists for host-ownership checks, where
 * "you are a host, but this event is another host's" should be reported
 * honestly rather than pretending the row does not exist.
 */
public class ForbiddenOperationException extends RuntimeException {
    public ForbiddenOperationException(String message) {
        super(message);
    }
}