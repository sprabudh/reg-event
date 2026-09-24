package com.example.eventreg.entity;

public enum RegistrationStatus {
    CONFIRMED,
    WAITLISTED,
    CHECKED_IN, // New: Scanned at the door
    NOT_IN    // New: Did not arrive
}