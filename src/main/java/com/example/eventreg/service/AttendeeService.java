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

        if (attendeeRepository.existsByEmailAndEventId(attendee.getEmail(), eventId)) {
            throw new DuplicateRegistrationException("Registration failed: Email is already registered for this event");
        }

        long confirmedCount = attendeeRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED);

        RegistrationStatus currentStatus = (confirmedCount < event.getCapacity())
                ? RegistrationStatus.CONFIRMED
                : RegistrationStatus.WAITLISTED;

        attendee.setStatus(currentStatus);
        attendee.setEvent(event);
        return attendeeRepository.save(attendee);
    }

    public Page<Attendee> getAttendeesByEvent(Long eventId, Pageable pageable) {
        eventService.getEventById(eventId);
        return attendeeRepository.findByEventId(eventId, pageable);
    }

    // NEW METHOD added to securely fetch only a specific user's registration data
    public Page<Attendee> getAttendeesByEventAndEmail(Long eventId, String email, Pageable pageable) {
        eventService.getEventById(eventId);
        return attendeeRepository.findByEventIdAndEmail(eventId, email, pageable);
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
        Attendee attendeeToDelete = getAttendeeById(id);
        Long eventId = attendeeToDelete.getEvent().getId();
        RegistrationStatus oldStatus = attendeeToDelete.getStatus();

        attendeeRepository.delete(attendeeToDelete);

        if (oldStatus == RegistrationStatus.CONFIRMED || oldStatus == null) {
            attendeeRepository.findFirstByEventIdAndStatusOrderByRegistrationDateAsc(eventId, RegistrationStatus.WAITLISTED)
                    .ifPresent(waitlistedAttendee -> {
                        waitlistedAttendee.setStatus(RegistrationStatus.CONFIRMED);
                        attendeeRepository.save(waitlistedAttendee);
                    });
        }
    }
}