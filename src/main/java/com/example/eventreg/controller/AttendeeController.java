package com.example.eventreg.controller;

import com.example.eventreg.entity.Attendee;
import com.example.eventreg.service.AttendeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority; // Added import for GrantedAuthority
import org.springframework.web.bind.annotation.*;

/**
 * CORS is configured once in SecurityConfig's CorsConfigurationSource.
 */
@RestController
@RequestMapping("/api")
public class AttendeeController {

    @Autowired
    private AttendeeService attendeeService;

    @Autowired
    private com.example.eventreg.user.UserRepository userRepository;

    @PostMapping("/events/{eventId}/attendees")
    public ResponseEntity<Attendee> registerAttendee(@PathVariable Long eventId, @Valid @RequestBody Attendee attendee) {
        Attendee registeredAttendee = attendeeService.registerAttendee(eventId, attendee);
        return new ResponseEntity<>(registeredAttendee, HttpStatus.CREATED);
    }

    @GetMapping("/events/{eventId}/attendees")
    public ResponseEntity<Page<Attendee>> getAttendeesByEvent(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            java.security.Principal principal) {

        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        String userEmail = principal.getName();

        // FIX: Explicitly mapped the stream to GrantedAuthority strings to prevent compilation errors
        boolean isAdmin = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN") || role.equals("ADMIN"));

        if (isAdmin) {
            // ADMIN gets all attendees for the event
            return ResponseEntity.ok(attendeeService.getAttendeesByEvent(eventId, PageRequest.of(page, size)));
        } else {
            // USER gets ONLY their own registration data
            Page<Attendee> userOnlyData = attendeeService.getAttendeesByEventAndEmail(eventId, userEmail, PageRequest.of(page, size));
            return ResponseEntity.ok(userOnlyData);
        }
    }

    /**
     * Reads a single registration. Same authorization rule as deleteAttendee --
     * without it, any authenticated user could read any attendee's name, email,
     * mobile, ticket UUID and QR image just by iterating ids.
     */
    @GetMapping("/attendees/{id}")
    public ResponseEntity<Attendee> getAttendeeById(@PathVariable Long id,
                                                    java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        Attendee attendee = attendeeService.getAttendeeById(id);
        attendeeService.assertCanManageAttendee(id, callerRole(), principal.getName(), callerUserId(principal));
        return ResponseEntity.ok(attendee);
    }

    @GetMapping("/attendees/me")
    public ResponseEntity<Page<com.example.eventreg.dto.MyTicketResponse>> getMyTickets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            java.security.Principal principal) {

        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(attendeeService.getMyTickets(principal.getName(), PageRequest.of(page, size)));
    }

    @GetMapping("/attendees/me/registrations")
    public ResponseEntity<java.util.List<com.example.eventreg.dto.RegistrationSummary>> getMyRegistrations(java.security.Principal principal) {
        if (principal == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        return ResponseEntity.ok(attendeeService.getMyRegistrations(principal.getName()));
    }

    @PutMapping("/attendees/{id}")
    public ResponseEntity<Attendee> updateAttendee(@PathVariable Long id,
                                                   @Valid @RequestBody Attendee attendeeDetails,
                                                   java.security.Principal principal) {
        Attendee updatedAttendee = attendeeService.updateAttendee(
                id, attendeeDetails, callerRole(), principalEmail(principal), callerUserId(principal));
        return ResponseEntity.ok(updatedAttendee);
    }

    /** Admin check mirrors EventController.isAdmin(). */
    private boolean isAdmin() {
        var auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
    }

    private String principalEmail(java.security.Principal principal) {
        return principal == null ? null : principal.getName();
    }

    /**
     * The caller's role, read from the authorities the JWT filter populated.
     * Falls back to ADMIN only when there is no authentication at all, which
     * SecurityConfig's anyRequest().authenticated() prevents anyway.
     */
    private com.example.eventreg.user.Role callerRole() {
        var auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth == null) return com.example.eventreg.user.Role.USER;
        for (var authority : auth.getAuthorities()) {
            String value = authority.getAuthority();
            // Authorities are unprefixed, but tolerate both spellings.
            if (value.equals("ADMIN") || value.equals("ROLE_ADMIN")) return com.example.eventreg.user.Role.ADMIN;
            if (value.equals("HOST") || value.equals("ROLE_HOST")) return com.example.eventreg.user.Role.HOST;
        }
        return com.example.eventreg.user.Role.USER;
    }

    /**
     * The caller's user row id, needed for host ownership checks. Principal
     * gives us the email (User.getUsername() is the email), so resolve it.
     */
    private Long callerUserId(java.security.Principal principal) {
        if (principal == null) return null;
        return userRepository.findByEmail(principal.getName()).map(u -> u.getId()).orElse(null);
    }

    @DeleteMapping("/attendees/{id}")
    public ResponseEntity<Void> deleteAttendee(@PathVariable Long id, java.security.Principal principal) {
        // Who is allowed to cancel this specific registration is decided in the
        // service: admin anything, user own only, host own-events only. Passing
        // the caller's identity down keeps that rule in one place instead of
        // being re-derived (and mis-derived) per endpoint.
        attendeeService.deleteAttendee(
                id, callerRole(), principalEmail(principal), callerUserId(principal));
        return ResponseEntity.noContent().build();
    }

    // --- Fast-Path Scanner Endpoint ---
    @PostMapping("/events/{eventId}/checkin/{ticketUuid}")
    public ResponseEntity<?> checkInAttendee(@PathVariable Long eventId, @PathVariable String ticketUuid) {
        try {
            Attendee checkedInUser = attendeeService.checkInAttendee(eventId, ticketUuid);
            return ResponseEntity.ok(checkedInUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Collections.singletonMap("message", e.getMessage()));
        }
    }
}