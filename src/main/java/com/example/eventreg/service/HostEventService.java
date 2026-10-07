package com.example.eventreg.service;

import com.example.eventreg.entity.Attendee;
import com.example.eventreg.entity.Event;
import com.example.eventreg.entity.Payment;
import com.example.eventreg.exception.ForbiddenOperationException;
import com.example.eventreg.repository.PaymentRepository;
import com.example.eventreg.user.Role;
import com.example.eventreg.user.User;
import com.example.eventreg.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HostEventService {

    private final EventService eventService;
    private final AttendeeService attendeeService;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    private User resolveHostUser(Principal principal) {
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ForbiddenOperationException("Host account not found."));
    }

    public Long resolveHostId(Principal principal) {
        return resolveHostUser(principal).getId();
    }

    public Event submitEvent(Event event, Principal principal) {
        User host = resolveHostUser(principal);
        String hostDisplayName = (host.getName() != null && !host.getName().isBlank())
                ? host.getName()
                : host.getEmail();
        return eventService.submitEventForApproval(event, host.getId(), hostDisplayName);
    }

    public Page<Event> getMyEvents(Principal principal, Pageable pageable) {
        return eventService.getEventsByHost(resolveHostId(principal), pageable);
    }

    public Event getOwnedEvent(Long eventId, Principal principal) {
        Long hostId = resolveHostId(principal);
        Event event = eventService.getEventById(eventId);
        if (!event.isOwnedBy(hostId)) {
            throw new ForbiddenOperationException("You can only manage events you host.");
        }
        return event;
    }

    public Event updateOwnedEvent(Long eventId, Event details, Principal principal) {
        getOwnedEvent(eventId, principal);
        return eventService.updateEvent(eventId, details);
    }

    public void deleteOwnedEvent(Long eventId, Principal principal) {
        getOwnedEvent(eventId, principal);
        eventService.deleteEvent(eventId);
    }

    public Page<Attendee> getAttendeesForOwnedEvent(Long eventId, Principal principal, Pageable pageable) {
        getOwnedEvent(eventId, principal);
        return attendeeService.getAttendeesByEvent(eventId, pageable);
    }

    public List<Payment> getPaymentsForOwnedEvent(Long eventId, Principal principal) {
        getOwnedEvent(eventId, principal);
        return paymentRepository.findByEventIdOrderByPaidAtDesc(eventId);
    }

    public Attendee checkInAttendeeForOwnedEvent(Long eventId, String ticketUuid, Principal principal) {
        getOwnedEvent(eventId, principal);
        return attendeeService.checkInAttendee(eventId, ticketUuid);
    }

    public void cancelAttendeeForOwnedEvent(Long attendeeId, Principal principal) {
        Attendee attendee = attendeeService.getAttendeeById(attendeeId);
        getOwnedEvent(attendee.getEvent() == null ? null : attendee.getEvent().getId(), principal);
        attendeeService.deleteAttendee(attendeeId, Role.HOST, principal.getName(), resolveHostId(principal));
    }
}