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
            @RequestParam(defaultValue = "100") int size) { // Set size to 100 to show all on frontend easily
        Page<Attendee> attendees = attendeeService.getAttendeesByEvent(eventId, PageRequest.of(page, size));
        return ResponseEntity.ok(attendees);
    }

    // --- NEW: Get single attendee API ---
    @GetMapping("/attendees/{id}")
    public ResponseEntity<Attendee> getAttendeeById(@PathVariable Long id) {
        Attendee attendee = attendeeService.getAttendeeById(id);
        return ResponseEntity.ok(attendee);
    }

    // --- NEW: Update attendee API ---
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
}