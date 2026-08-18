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

    // Register a new attendee to a specific event
    @PostMapping("/events/{eventId}/attendees")
    public ResponseEntity<Attendee> registerAttendee(
            @PathVariable Long eventId,
            @Valid @RequestBody Attendee attendee) {
        Attendee registeredAttendee = attendeeService.registerAttendee(eventId, attendee);
        return new ResponseEntity<>(registeredAttendee, HttpStatus.CREATED);
    }

    // Get all attendees for a specific event (with pagination)
    @GetMapping("/events/{eventId}/attendees")
    public ResponseEntity<Page<Attendee>> getAttendeesByEvent(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<Attendee> attendees = attendeeService.getAttendeesByEvent(eventId, PageRequest.of(page, size));
        return ResponseEntity.ok(attendees);
    }

    // Delete an attendee
    @DeleteMapping("/attendees/{id}")
    public ResponseEntity<Void> deleteAttendee(@PathVariable Long id) {
        attendeeService.deleteAttendee(id);
        return ResponseEntity.noContent().build();
    }
}