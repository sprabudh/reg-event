package com.example.eventreg.controller;

import com.example.eventreg.entity.Event;
import com.example.eventreg.entity.Payment;
import com.example.eventreg.service.HostEventService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/host/events")
public class HostEventController {

    private final HostEventService hostEventService;

    public HostEventController(HostEventService hostEventService) {
        this.hostEventService = hostEventService;
    }

    @PostMapping
    public ResponseEntity<Event> submitEvent(@Valid @RequestBody Event event, Principal principal) {
        return new ResponseEntity<>(hostEventService.submitEvent(event, principal), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<Event>> getMyEvents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        return ResponseEntity.ok(hostEventService.getMyEvents(principal, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getMyEvent(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(hostEventService.getOwnedEvent(id, principal));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateMyEvent(@PathVariable Long id,
                                               @Valid @RequestBody Event details,
                                               Principal principal) {
        return ResponseEntity.ok(hostEventService.updateOwnedEvent(id, details, principal));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMyEvent(@PathVariable Long id, Principal principal) {
        hostEventService.deleteOwnedEvent(id, principal);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/attendees")
    public ResponseEntity<?> getAttendees(@PathVariable Long id,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "100") int size,
                                          Principal principal) {
        return ResponseEntity.ok(
                hostEventService.getAttendeesForOwnedEvent(id, principal, PageRequest.of(page, size)));
    }

    @GetMapping("/{id}/payments")
    public ResponseEntity<List<Payment>> getPayments(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(hostEventService.getPaymentsForOwnedEvent(id, principal));
    }

    @PostMapping("/{id}/checkin/{ticketUuid}")
    public ResponseEntity<?> checkIn(@PathVariable Long id,
                                     @PathVariable String ticketUuid,
                                     Principal principal) {
        return ResponseEntity.ok(hostEventService.checkInAttendeeForOwnedEvent(id, ticketUuid, principal));
    }

    @DeleteMapping("/attendees/{attendeeId}")
    public ResponseEntity<Void> cancelAttendee(@PathVariable Long attendeeId, Principal principal) {
        hostEventService.cancelAttendeeForOwnedEvent(attendeeId, principal);
        return ResponseEntity.noContent().build();
    }
}