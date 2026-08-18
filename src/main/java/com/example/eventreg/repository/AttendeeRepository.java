package com.example.eventreg.repository;

import com.example.eventreg.entity.Attendee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AttendeeRepository extends JpaRepository<Attendee, Long> {

    // Finds all attendees for a specific event with pagination
    Page<Attendee> findByEventId(Long eventId, Pageable pageable);

    // Checks if an email is already registered for an event
    boolean existsByEmailAndEventId(String email, Long eventId);

    // Counts how many people are currently registered
    long countByEventId(Long eventId);
}