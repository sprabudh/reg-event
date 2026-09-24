package com.example.eventreg.repository;

import com.example.eventreg.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByAttendeeId(Long attendeeId);

    List<Payment> findByAttendeeIdIn(List<Long> attendeeIds);

    List<Payment> findByEventIdOrderByPaidAtDesc(Long eventId);
}