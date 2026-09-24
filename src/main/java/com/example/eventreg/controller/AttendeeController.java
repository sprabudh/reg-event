package com.example.eventreg.controller;

import com.example.eventreg.entity.Attendee;
import com.example.eventreg.service.AttendeeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin("*")
public class AttendeeController {

    @Autowired
    private AttendeeService attendeeService;

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

        // FIX: Check for both "ADMIN" and "ROLE_ADMIN" to ensure the Admin is correctly identified
        boolean isAdmin = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));

        if (isAdmin) {
            // ADMIN gets all attendees for the event
            return ResponseEntity.ok(attendeeService.getAttendeesByEvent(eventId, PageRequest.of(page, size)));
        } else {
            // USER gets ONLY their own registration data
            Page<Attendee> userOnlyData = attendeeService.getAttendeesByEventAndEmail(eventId, userEmail, PageRequest.of(page, size));
            return ResponseEntity.ok(userOnlyData);
        }
    }

    @GetMapping("/attendees/{id}")
    public ResponseEntity<Attendee> getAttendeeById(@PathVariable Long id) {
        Attendee attendee = attendeeService.getAttendeeById(id);
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
    public ResponseEntity<Attendee> updateAttendee(@PathVariable Long id, @Valid @RequestBody Attendee attendeeDetails) {
        Attendee updatedAttendee = attendeeService.updateAttendee(id, attendeeDetails);
        return ResponseEntity.ok(updatedAttendee);
    }

    @DeleteMapping("/attendees/{id}")
    public ResponseEntity<Void> deleteAttendee(@PathVariable Long id) {
        attendeeService.deleteAttendee(id);
        return ResponseEntity.noContent().build();
    }

    // --- Fast-Path Scanner Endpoint ---
    // Make sure this says @PostMapping
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