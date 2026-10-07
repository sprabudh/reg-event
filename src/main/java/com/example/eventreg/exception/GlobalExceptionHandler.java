package com.example.eventreg.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Catches 404 Not Found errors (Event/Attendee doesn't exist)
    @ExceptionHandler({EventNotFoundException.class, AttendeeNotFoundException.class})
    public ResponseEntity<Map<String, Object>> handleNotFoundException(RuntimeException ex) {
        return buildErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    // 2. Catches 409 Conflict errors (Event Full or Duplicate Email)
    @ExceptionHandler({EventFullException.class, DuplicateRegistrationException.class, EventDeletionException.class})
    public ResponseEntity<Map<String, Object>> handleConflictException(RuntimeException ex) {
        return buildErrorResponse(ex.getMessage(), HttpStatus.CONFLICT);
    }

    // 3. Catches "Event already ended" registration attempts
    @ExceptionHandler(EventExpiredException.class)
    public ResponseEntity<Map<String, Object>> handleEventExpiredException(EventExpiredException ex) {
        return buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    // 3b. Catches permission problems: editing someone else's registration,
    // editing after check-in, or a user trying to change their own email.
    @ExceptionHandler(NotYourRegistrationException.class)
    public ResponseEntity<Map<String, Object>> handleNotYourRegistrationException(NotYourRegistrationException ex) {
        return buildErrorResponse(ex.getMessage(), HttpStatus.FORBIDDEN);
    }

    // 3c-2. Host touched a resource they do not own.
    @ExceptionHandler(ForbiddenOperationException.class)
    public ResponseEntity<Map<String, Object>> handleForbiddenOperation(ForbiddenOperationException ex) {
        return buildErrorResponse(ex.getMessage(), HttpStatus.FORBIDDEN);
    }

    // 3c-3. Account exists but is the wrong kind of account for this action
    // (e.g. picking "Host" at login for an attendee account).
    @ExceptionHandler(AccountTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleAccountTypeMismatch(AccountTypeMismatchException ex) {
        return buildErrorResponse(ex.getMessage(), HttpStatus.UNAUTHORIZED);
    }

    // 3c-4. Duplicate email on register. Without this it surfaces as a 500
    // from the unique constraint, and the client shows a generic failure.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        return buildErrorResponse("That email is already registered. Try signing in instead.",
                HttpStatus.CONFLICT);
    }

    // 3c-5. Bad input we reject ourselves (blank category name, duplicate
    // pending category request, ...). These are caller errors, not server
    // faults -- without this they hit the catch-all below and report 500.
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return buildErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    // 3c. Wrong email/password from the authentication manager. Without this
    // it falls through to the catch-all below and is reported as a 500, which
    // makes a simple typo look like a server fault.
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleBadCredentialsException(BadCredentialsException ex) {
        return buildErrorResponse("Invalid email or password.", HttpStatus.UNAUTHORIZED);
    }

    // 4. Catches Validation errors (e.g., empty name, invalid email format)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("message", "Validation failed");
        response.put("errors", errors); // Shows exactly which fields failed

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // 5. Catches all other unexpected server errors (500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobalException(Exception ex) {
        return buildErrorResponse("An unexpected error occurred: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // Helper method to build a clean JSON response
    private ResponseEntity<Map<String, Object>> buildErrorResponse(String message, HttpStatus status) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", status.value());
        response.put("message", message);
        return new ResponseEntity<>(response, status);
    }
}