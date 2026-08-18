package com.example.eventreg.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT) // 409 Conflict
public class EventFullException extends RuntimeException {
    public EventFullException(String message) {
        super(message);
    }
}