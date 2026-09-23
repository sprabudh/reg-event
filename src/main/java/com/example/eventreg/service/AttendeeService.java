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

import java.util.UUID;

@Service
public class AttendeeService {

    @Autowired
    private AttendeeRepository attendeeRepository;

    @Autowired
    private EventService eventService;

    @Autowired
    private QrCodeService qrCodeService; // Inject the new service

    @Transactional
    public Attendee registerAttendee(Long eventId, Attendee attendee) {
        Event event = eventService.getEventById(eventId);

        if (attendeeRepository.existsByEmailAndEventId(attendee.getEmail(), eventId)) {
            throw new DuplicateRegistrationException("Registration failed: Email is already registered for this event");
        }

        // Count CONFIRMED + CHECKED_IN so capacity tracking remains accurate
        long takenSeats = attendeeRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CONFIRMED) +
                attendeeRepository.countByEventIdAndStatus(eventId, RegistrationStatus.CHECKED_IN);

        if (takenSeats < event.getCapacity()) {
            attendee.setStatus(RegistrationStatus.CONFIRMED);
            // Generate Ticketing Data
            String uuid = UUID.randomUUID().toString();
            attendee.setTicketUuid(uuid);
            attendee.setQrCodeBase64(qrCodeService.generateQRCodeBase64(uuid));
        } else {
            attendee.setStatus(RegistrationStatus.WAITLISTED);
            // Waitlisted users do not get a ticket/QR code yet
        }

        attendee.setEvent(event);
        return attendeeRepository.save(attendee);
    }

    public Page<Attendee> getAttendeesByEvent(Long eventId, Pageable pageable) {
        return attendeeRepository.findByEventId(eventId, pageable);
    }

    public Page<Attendee> getAttendeesByEventAndEmail(Long eventId, String email, Pageable pageable) {
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

        // Auto-Promote Waitlisted User & Generate their Ticket
        if (oldStatus == RegistrationStatus.CONFIRMED || oldStatus == RegistrationStatus.CHECKED_IN || oldStatus == null) {
            attendeeRepository.findFirstByEventIdAndStatusOrderByRegistrationDateAsc(eventId, RegistrationStatus.WAITLISTED)
                    .ifPresent(waitlistedAttendee -> {
                        waitlistedAttendee.setStatus(RegistrationStatus.CONFIRMED);
                        String uuid = UUID.randomUUID().toString();
                        waitlistedAttendee.setTicketUuid(uuid);
                        waitlistedAttendee.setQrCodeBase64(qrCodeService.generateQRCodeBase64(uuid));
                        attendeeRepository.save(waitlistedAttendee);
                    });
        }
    }

    // NEW: Time-aware Check-in Logic
    @Transactional
    public Attendee checkInAttendee(Long eventId, String ticketUuid) {
        Attendee attendee = attendeeRepository.findByEventIdAndTicketUuid(eventId, ticketUuid)
                .orElseThrow(() -> new AttendeeNotFoundException("Invalid Ticket: No matching record found for this event."));

        // 1. Time-Bound Guardrail: Only allow check-ins on the day of the event
        // FIX: event.getDate() is already a LocalDate object, so we assign it directly.
        java.time.LocalDate eventDate = attendee.getEvent().getDate();
        java.time.LocalDate today = java.time.LocalDate.now();

        if (!today.equals(eventDate)) {
            throw new IllegalStateException("Check-in rejected: This event is scheduled for " + eventDate + ". You can only check in on the day of the event.");
        }

        // 2. Prevent Double Check-ins
        if (attendee.getStatus() == RegistrationStatus.CHECKED_IN) {
            throw new IllegalStateException("Attendee has already checked in.");
        }

        // 3. Ensure they actually hold a confirmed ticket
        if (attendee.getStatus() != RegistrationStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot check-in. Current status is: " + attendee.getStatus());
        }

        attendee.setStatus(RegistrationStatus.CHECKED_IN);
        return attendeeRepository.save(attendee);
    }
}