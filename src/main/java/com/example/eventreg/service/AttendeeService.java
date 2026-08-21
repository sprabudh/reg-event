package com.example.eventreg.service;

import com.example.eventreg.entity.Attendee;
import com.example.eventreg.entity.Event;
import com.example.eventreg.entity.RegistrationStatus;
import com.example.eventreg.exception.AttendeeNotFoundException;
import com.example.eventreg.exception.DuplicateRegistrationException;
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

        // 1. Check if the user is already registered for this event first
        if (attendeeRepository.existsByEmailAndEventId(attendee.getEmail(), eventId)) {
            throw new DuplicateRegistrationException("Registration failed: Email is already registered for this event");
        }

        // 2. Count ONLY the currently confirmed attendees
        long confirmedCount = attendeeRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED);

        // 3. Determine the status dynamically based on capacity
        RegistrationStatus currentStatus = (confirmedCount < event.getCapacity())
                ? RegistrationStatus.CONFIRMED
                : RegistrationStatus.WAITLISTED;

        // 4. Assign the status, link the event, and save successfully
        attendee.setStatus(currentStatus);
        attendee.setEvent(event);
        return attendeeRepository.save(attendee);
    }

    public Page<Attendee> getAttendeesByEvent(Long eventId, Pageable pageable) {
        eventService.getEventById(eventId);
        return attendeeRepository.findByEventId(eventId, pageable);
    }

    public Attendee getAttendeeById(Long id) {
        return attendeeRepository.findById(id)
                .orElseThrow(() -> new AttendeeNotFoundException("Attendee not found with id: " + id));
    }

    @Transactional
    public Attendee updateAttendee(Long id, Attendee attendeeDetails) {
        Attendee attendee = getAttendeeById(id);

        if (!attendee.getEmail().equals(attendeeDetails.getEmail())) {
            if (attendeeRepository.existsByEmailAndEventId(attendeeDetails.getEmail(), attendee.getEvent().getId())) {
                throw new DuplicateRegistrationException("Update failed: Email is already registered for this event");
            }
        }

        attendee.setName(attendeeDetails.getName());
        attendee.setEmail(attendeeDetails.getEmail());
        return attendeeRepository.save(attendee);
    }

    @Transactional
    public void deleteAttendee(Long id) {
        // 1. Get the attendee before deleting to know their status and event
        Attendee attendeeToDelete = getAttendeeById(id);
        Long eventId = attendeeToDelete.getEvent().getId();
        RegistrationStatus oldStatus = attendeeToDelete.getStatus();

        // 2. Delete the attendee
        attendeeRepository.delete(attendeeToDelete);

        // 3. Auto-Promotion Logic: If they gave up a CONFIRMED seat, fill it!
        if (oldStatus == RegistrationStatus.CONFIRMED || oldStatus == null) {
            attendeeRepository.findFirstByEventIdAndStatusOrderByRegistrationDateAsc(eventId, RegistrationStatus.WAITLISTED)
                    .ifPresent(waitlistedAttendee -> {
                        // Upgrade their status
                        waitlistedAttendee.setStatus(RegistrationStatus.CONFIRMED);
                        // Save the promoted attendee
                        attendeeRepository.save(waitlistedAttendee);
                    });
        }
    }
}