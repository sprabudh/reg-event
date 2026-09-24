package com.example.eventreg.controller;

import com.example.eventreg.entity.Event;
import com.example.eventreg.service.EventService;
import com.example.eventreg.repository.AttendeeRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@CrossOrigin("*")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private AttendeeRepository attendeeRepository;

    @PostMapping
    public ResponseEntity<Event> createEvent(@Valid @RequestBody Event event) {
        Event createdEvent = eventService.createEvent(event);
        return new ResponseEntity<>(createdEvent, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<Event>> getAllEvents(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        boolean isAdmin = isAdmin();

        // Admins see every event (including ended ones); users only see upcoming events
        Page<Event> events = eventService.getAllEvents(name, categoryId, PageRequest.of(page, size), isAdmin);
        return ResponseEntity.ok(events);
    }

    private boolean isAdmin() {
        var auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ADMIN"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @Valid @RequestBody Event eventDetails) {
        Event updatedEvent = eventService.updateEvent(id, eventDetails);
        return ResponseEntity.ok(updatedEvent);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<java.util.Map<String, Object>> getEventStats(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        long registered = attendeeRepository.countByEventId(id);

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("capacity", event.getCapacity());
        stats.put("registered", registered);
        stats.put("available", Math.max(0, event.getCapacity() - registered));
        return ResponseEntity.ok(stats);
    }
}