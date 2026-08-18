package com.example.eventreg.service;

import com.example.eventreg.entity.Attendee;
import com.example.eventreg.entity.Event;
import com.example.eventreg.exception.AttendeeNotFoundException;
import com.example.eventreg.exception.DuplicateRegistrationException;
import com.example.eventreg.exception.EventFullException;
import com.example.eventreg.repository.AttendeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AttendeeService {

    @Autowired
    private AttendeeRepository attendeeRepository;

    @Autowired
    private EventService eventService;

    @Transactional
    public Attendee registerAttendee(Long eventId, Attendee attendee) {
        Event event = eventService.getEventById(eventId);

        if (attendeeRepository.countByEventId(eventId) >= event.getCapacity()) {
            throw new EventFullException("Registration failed: Event capacity is full");
        }

        if (attendeeRepository.existsByEmailAndEventId(attendee.getEmail(), eventId)) {
            throw new DuplicateRegistrationException("Registration failed: Email is already registered for this event");
        }

        attendee.setEvent(event);
        return attendeeRepository.save(attendee);
    }

    public Page<Attendee> getAttendeesByEvent(Long eventId, Pageable pageable) {
        eventService.getEventById(eventId);
        return attendeeRepository.findByEventId(eventId, pageable);
    }

    // --- NEW: Get a single Attendee by ID ---
    public Attendee getAttendeeById(Long id) {
        return attendeeRepository.findById(id)
                .orElseThrow(() -> new AttendeeNotFoundException("Attendee not found with id: " + id));
    }

    // --- NEW: Update Attendee ---
    @Transactional
    public Attendee updateAttendee(Long id, Attendee attendeeDetails) {
        Attendee attendee = getAttendeeById(id);

        // Check if they are trying to change to an email that someone else is already using in this event
        if (!attendee.getEmail().equals(attendeeDetails.getEmail())) {
            if (attendeeRepository.existsByEmailAndEventId(attendeeDetails.getEmail(), attendee.getEvent().getId())) {
                throw new DuplicateRegistrationException("Update failed: Email is already registered for this event");
            }
        }

        attendee.setName(attendeeDetails.getName());
        attendee.setEmail(attendeeDetails.getEmail());
        return attendeeRepository.save(attendee);
    }

    public void deleteAttendee(Long id) {
        Attendee attendee = getAttendeeById(id);
        attendeeRepository.delete(attendee);
    }
}