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
    private AttendeeRepository attendeeRepository;

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public Page<Event> getAllEvents(String name, Long categoryId, Pageable pageable) {
        return eventRepository.searchEvents(name, categoryId, pageable);
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