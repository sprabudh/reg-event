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
    private EventService eventService; // We reuse the Event logic here!

    @Transactional
    public Attendee registerAttendee(Long eventId, Attendee attendee) {
        // 1. Find Event (Throws 404 if not found)
        Event event = eventService.getEventById(eventId);

        // 2. Check Capacity (Throws 409 if full)
        long currentAttendees = attendeeRepository.countByEventId(eventId);
        if (currentAttendees >= event.getCapacity()) {
            throw new EventFullException("Registration failed: Event capacity is full");
        }

        // 3. Check Duplicate Email (Throws 409 if already registered)
        if (attendeeRepository.existsByEmailAndEventId(attendee.getEmail(), eventId)) {
            throw new DuplicateRegistrationException("Registration failed: Email is already registered for this event");
        }

        // 4. Save Attendee
        attendee.setEvent(event);
        return attendeeRepository.save(attendee);
    }

    public Page<Attendee> getAttendeesByEvent(Long eventId, Pageable pageable) {
        eventService.getEventById(eventId); // Validate event exists
        return attendeeRepository.findByEventId(eventId, pageable);
    }

    public void deleteAttendee(Long id) {
        Attendee attendee = attendeeRepository.findById(id)
                .orElseThrow(() -> new AttendeeNotFoundException("Attendee not found with id: " + id));
        attendeeRepository.delete(attendee);
    }
}