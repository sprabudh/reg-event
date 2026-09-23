package com.example.eventreg.entity;

public enum RegistrationStatus {
    CONFIRMED,
    WAITLISTED,
    CHECKED_IN, // New: Scanned at the door
    NO_SHOW     // New: Did not arrive
}