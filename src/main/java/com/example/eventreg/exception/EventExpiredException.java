package com.example.eventreg.exception;

public class EventExpiredException extends RuntimeException {
    public EventExpiredException(String message) {
        super(message);
    }
}