package com.example.eventreg.service;

import com.example.eventreg.entity.ApprovalStatus;
import com.example.eventreg.entity.Event;
import com.example.eventreg.exception.EventDeletionException;
import com.example.eventreg.exception.EventExpiredException;
import com.example.eventreg.exception.EventNotFoundException;
import com.example.eventreg.repository.AttendeeRepository;
import com.example.eventreg.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AttendeeRepository attendeeRepository;

    public Event createEvent(Event event) {
        if (event.isExpired()) {
            throw new EventExpiredException("Cannot create event: the scheduled start time has already passed.");
        }
        // Stamped explicitly rather than relying on the entity's field
        // default: Jackson builds this object from the request body, so an
        // absent approval_status would otherwise persist as NULL. Admin
        // creates are pre-approved by definition -- there is no review step.
        event.setApprovalStatus(ApprovalStatus.APPROVED);
        // Admin creates have no owning host, but host_name is still populated
        // so admin-hosted events (e.g. "DJ night") show a host instead of NULL.
        event.setHostName("Admin");
        return eventRepository.save(event);
    }

    /**
     * Host submission. Persisted immediately so admin can review it against
     * real rows, but left PENDING so it stays out of every attendee-facing
     * query until approved. Approval is the publish step -- there is no
     * separate "go live" flag.
     */
    public Event submitEventForApproval(Event event, Long hostId, String hostName) {
        if (event.isExpired()) {
            throw new EventExpiredException("Cannot create event: the scheduled start time has already passed.");
        }
        event.setHostedByUserId(hostId);
        event.setHostName(hostName);
        event.setApprovalStatus(ApprovalStatus.PENDING);
        event.setApprovedByUserId(null);
        event.setApprovedAt(null);
        event.setRejectionReason(null);
        return eventRepository.save(event);
    }

    /** Admin approval. This is what makes the event visible to attendees. */
    public Event approveEvent(Long eventId, Long adminId) {
        Event event = getEventById(eventId);
        event.setApprovalStatus(ApprovalStatus.APPROVED);
        event.setApprovedByUserId(adminId);
        event.setApprovedAt(LocalDateTime.now());
        event.setRejectionReason(null);
        return eventRepository.save(event);
    }

    public Event rejectEvent(Long eventId, Long adminId, String reason) {
        Event event = getEventById(eventId);
        event.setApprovalStatus(ApprovalStatus.REJECTED);
        event.setApprovedByUserId(adminId);
        event.setApprovedAt(LocalDateTime.now());
        event.setRejectionReason(reason);
        return eventRepository.save(event);
    }

    public Page<Event> getAllEvents(String name, Long categoryId, Pageable pageable, boolean includeExpired) {
        // Existing callers keep seeing everything, as before.
        return getAllEvents(name, categoryId, pageable, includeExpired, true);
    }

    /**
     * @param includeUnapproved when false, PENDING/REJECTED rows are filtered
     *                          out. Admin passes true (they need to review
     *                          them); attendees get false.
     */
    public Page<Event> getAllEvents(String name, Long categoryId, Pageable pageable,
                                    boolean includeExpired, boolean includeUnapproved) {

        Page<Event> matches = includeUnapproved
                ? eventRepository.searchEvents(name, categoryId, pageable)
                : eventRepository.searchApprovedEvents(name, categoryId, ApprovalStatus.APPROVED, pageable);

        if (includeExpired) return matches;

        // Fetch ALL matches, filter out ended events, THEN apply pagination.
        // (Filtering after pagination incorrectly shrinks the page and total count.)
        List<Event> all = eventRepository
                .searchApprovedEvents(name, categoryId, ApprovalStatus.APPROVED, Pageable.unpaged())
                .getContent().stream()
                .filter(event -> !event.isExpired())
                .collect(Collectors.toList());

        int start = (int) Math.min(pageable.getOffset(), all.size());
        int end = (int) Math.min((long) start + pageable.getPageSize(), all.size());
        return new PageImpl<>(all.subList(start, end), pageable, all.size());
    }

    /** A host's own submissions. */
    public Page<Event> getEventsByHost(Long hostId, Pageable pageable) {
        return eventRepository.findByHostedByUserIdOrderByIdDesc(hostId, pageable);
    }

    /** Admin's approval queue. */
    public Page<Event> getEventsByApprovalStatus(ApprovalStatus status, Pageable pageable) {
        return eventRepository.findByApprovalStatusOrderByIdDesc(status, pageable);
    }

    /** Counts, not rows -- used for the admin nav badge. */
    public long countByApprovalStatus(ApprovalStatus status) {
        return eventRepository.countByApprovalStatus(status);
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));
    }

    public Event updateEvent(Long id, Event eventDetails) {
            if (eventDetails.isExpired()) {
                throw new EventExpiredException("Cannot save event: the scheduled start time has already passed.");
            }
            Event event = getEventById(id);
            event.setName(eventDetails.getName());
            event.setDate(eventDetails.getDate());
            event.setCapacity(eventDetails.getCapacity());
            event.setCategory(eventDetails.getCategory());
            event.setLocation(eventDetails.getLocation());
            event.setTime(eventDetails.getTime());
            event.setDuration(eventDetails.getDuration());
            event.setPrice(eventDetails.getPrice());
            event.setIsOnline(eventDetails.getIsOnline());
            event.setIsRefundable(eventDetails.getIsRefundable());

            return eventRepository.save(event);
        }

    public void deleteEvent(Long id) {
        Event event = getEventById(id);

        if (attendeeRepository.countByEventId(id) > 0) {
            throw new EventDeletionException("Cannot delete event because attendees are currently registered.");
        }

        eventRepository.delete(event);
    }
}