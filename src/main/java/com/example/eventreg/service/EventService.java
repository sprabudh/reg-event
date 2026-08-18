package com.example.eventreg.service;

import com.example.eventreg.entity.Event;
import com.example.eventreg.exception.EventDeletionException;
import com.example.eventreg.exception.EventNotFoundException;
import com.example.eventreg.repository.AttendeeRepository;
import com.example.eventreg.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AttendeeRepository attendeeRepository; // Added this!

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    // Updated to support mandatory Filtering!
    public Page<Event> getAllEvents(String name, Pageable pageable) {
        if (name != null && !name.isEmpty()) {
            return eventRepository.findByNameContainingIgnoreCase(name, pageable);
        }
        return eventRepository.findAll(pageable);
    }

    public Event getEventById(Long id) {
        return eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException("Event not found with id: " + id));
    }

    public Event updateEvent(Long id, Event eventDetails) {
        Event event = getEventById(id);
        event.setName(eventDetails.getName());
        event.setDate(eventDetails.getDate());
        event.setCapacity(eventDetails.getCapacity());
        return eventRepository.save(event);
    }

    public void deleteEvent(Long id) {
        Event event = getEventById(id);

        // Fulfilling Edge Case 7: Reject deletion if attendees exist
        if (attendeeRepository.countByEventId(id) > 0) {
            throw new EventDeletionException("Cannot delete event because attendees are currently registered.");
        }

        eventRepository.delete(event);
    }
}