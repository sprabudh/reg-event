package com.example.eventreg.user;

public enum Role {
    USER,
    ADMIN,
    /**
     * Event manager. Submits events for approval, and manages only the events
     * they own (enforced via Event.hostedByUserId, not via role alone).
     *
     * Authorities are emitted unprefixed by User.getAuthorities(), so every
     * reference to this value in SecurityConfig is hasAuthority("HOST") --
     * never hasRole("HOST"), which would look for a "ROLE_HOST" authority and
     * match nothing.
     */
    HOST
}