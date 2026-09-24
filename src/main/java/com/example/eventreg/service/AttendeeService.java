package com.example.eventreg.service;

import com.example.eventreg.entity.Attendee;
import com.example.eventreg.entity.Event;
import com.example.eventreg.entity.Payment;
import com.example.eventreg.entity.RefundStatus;
import com.example.eventreg.entity.RegistrationStatus;
import com.example.eventreg.exception.AttendeeNotFoundException;
import com.example.eventreg.exception.DuplicateRegistrationException;
import com.example.eventreg.repository.AttendeeRepository;
import com.example.eventreg.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AttendeeService {

    @Autowired
    private AttendeeRepository attendeeRepository;

    @Autowired
    private EventService eventService;

    @Autowired
    private QrCodeService qrCodeService; // Inject the new service

    @Autowired
    private PaymentRepository paymentRepository;

    @Transactional
    public Attendee registerAttendee(Long eventId, Attendee attendee) {
        Event event = eventService.getEventById(eventId);

        // Prevent registrations for events that have already ended
        if (event.isExpired()) {
            throw new com.example.eventreg.exception.EventExpiredException("This event has ended. Registrations are closed.");
        }

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
        Attendee saved = attendeeRepository.save(attendee);

        // Paid events get a (simulated) payment/invoice record once a seat is CONFIRMED
        if (saved.getStatus() == RegistrationStatus.CONFIRMED && isPaidEvent(event)) {
            createPayment(saved, event);
        }

        return saved;
    }

    public Page<Attendee> getAttendeesByEvent(Long eventId, Pageable pageable) {
        return attendeeRepository.findByEventId(eventId, pageable);
    }

    public Page<Attendee> getAttendeesByEventAndEmail(Long eventId, String email, Pageable pageable) {
        return attendeeRepository.findByEventIdAndEmail(eventId, email, pageable);
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public org.springframework.data.domain.Page<com.example.eventreg.dto.MyTicketResponse> getMyTickets(String email, Pageable pageable) {
        Page<Attendee> page = attendeeRepository.findByEmailAndStatusIn(
                email,
                java.util.List.of(RegistrationStatus.CONFIRMED, RegistrationStatus.CHECKED_IN),
                pageable
        );

        java.util.List<Long> attendeeIds = page.getContent().stream().map(Attendee::getId).toList();
        java.util.Map<Long, Payment> paymentByAttendee = attendeeIds.isEmpty()
                ? java.util.Map.of()
                : paymentRepository.findByAttendeeIdIn(attendeeIds).stream()
                        .collect(java.util.stream.Collectors.toMap(Payment::getAttendeeId, p -> p));

        return page.map(a -> toMyTicketResponse(a, paymentByAttendee.get(a.getId())));
    }

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public java.util.List<com.example.eventreg.dto.RegistrationSummary> getMyRegistrations(String email) {
        return attendeeRepository.findByEmail(email).stream()
                .map(a -> com.example.eventreg.dto.RegistrationSummary.builder()
                        .eventId(a.getEvent() == null ? null : a.getEvent().getId())
                        .status(a.getStatus() == null ? null : a.getStatus().name())
                        .build())
                .toList();
    }

    private com.example.eventreg.dto.MyTicketResponse toMyTicketResponse(Attendee attendee, Payment payment) {
        Event event = attendee.getEvent();
        return com.example.eventreg.dto.MyTicketResponse.builder()
                .id(attendee.getId())
                .name(attendee.getName())
                .email(attendee.getEmail())
                .mobileNumber(attendee.getMobileNumber())
                .registrationDate(attendee.getRegistrationDate())
                .status(attendee.getStatus() == null ? null : attendee.getStatus().name())
                .ticketUuid(attendee.getTicketUuid())
                .qrCodeBase64(attendee.getQrCodeBase64())
                .eventId(event == null ? null : event.getId())
                .eventName(event == null ? null : event.getName())
                .eventDate(event == null ? null : event.getDate())
                .eventTime(event == null ? null : event.getTime())
                .eventDuration(event == null ? null : event.getDuration())
                .eventLocation(event == null ? null : event.getLocation())
                .eventIsOnline(event == null ? null : event.getIsOnline())
                .eventPrice(event == null ? null : event.getPrice())
                .invoiceNo(payment == null ? null : payment.getInvoiceNo())
                .amount(payment == null ? null : payment.getAmount())
                .refundStatus(payment == null || payment.getRefundStatus() == null ? null : payment.getRefundStatus().name())
                .build();
    }

    private boolean isPaidEvent(Event event) {
        return event != null && event.getPrice() != null && event.getPrice() > 0;
    }

    private Payment createPayment(Attendee attendee, Event event) {
        Payment payment = new Payment();
        payment.setAttendeeId(attendee.getId());
        payment.setAttendeeName(attendee.getName());
        payment.setEventId(event.getId());
        payment.setEventName(event.getName());
        payment.setAmount(event.getPrice());
        payment.setStatus("PAID");
        payment.setPaidAt(LocalDateTime.now());
        payment.setRefundStatus(RefundStatus.NONE);
        // Unique interim value so the NOT NULL column passes on first insert (id isn't known yet)
        payment.setInvoiceNo("INV-" + System.nanoTime());

        Payment saved = paymentRepository.save(payment);
        saved.setInvoiceNo(String.format("INV-%d-%06d", java.time.Year.now().getValue(), saved.getId()));
        return paymentRepository.save(saved);
    }

    private void recordCancellation(Attendee attendee) {
        paymentRepository.findByAttendeeId(attendee.getId()).ifPresentOrElse(
                payment -> {
                    Event event = attendee.getEvent();
                    boolean refundable = event != null && Boolean.TRUE.equals(event.getIsRefundable());
                    payment.setRefundStatus(refundable ? RefundStatus.REFUNDED : RefundStatus.FORFEITED);
                    if (payment.getAttendeeName() == null || payment.getAttendeeName().isBlank()) {
                        payment.setAttendeeName(attendee.getName());
                    }
                    payment.setCancelledAt(LocalDateTime.now());
                    paymentRepository.save(payment);
                },
                // No payment record (free event or legacy unpaid) -> create a ₹0 cancellation record
                () -> {
                    Event event = attendee.getEvent();
                    Payment payment = new Payment();
                    payment.setAttendeeId(attendee.getId());
                    payment.setAttendeeName(attendee.getName());
                    payment.setEventId(event.getId());
                    payment.setEventName(event.getName());
                    payment.setAmount(0.0);
                    payment.setStatus("PAID");
                    payment.setPaidAt(attendee.getRegistrationDate() != null ? attendee.getRegistrationDate() : LocalDateTime.now());
                    payment.setRefundStatus(RefundStatus.NONE);
                    payment.setCancelledAt(LocalDateTime.now());
                    // Unique interim value so the NOT NULL column passes on first insert (id isn't known yet)
                    payment.setInvoiceNo("INV-" + System.nanoTime());

                    Payment saved = paymentRepository.save(payment);
                    saved.setInvoiceNo(String.format("INV-%d-%06d", java.time.Year.now().getValue(), saved.getId()));
                    paymentRepository.save(saved);
                }
        );
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

        // Record the refund/forfeit/cancel outcome BEFORE deleting the attendee (invoice row is kept as history)
        recordCancellation(attendeeToDelete);

        attendeeRepository.delete(attendeeToDelete);

        // Auto-Promote Waitlisted User, Generate their Ticket & charge them if it's a paid event
        if (oldStatus == RegistrationStatus.CONFIRMED || oldStatus == RegistrationStatus.CHECKED_IN || oldStatus == null) {
            attendeeRepository.findFirstByEventIdAndStatusOrderByRegistrationDateAsc(eventId, RegistrationStatus.WAITLISTED)
                    .ifPresent(waitlistedAttendee -> {
                        waitlistedAttendee.setStatus(RegistrationStatus.CONFIRMED);
                        String uuid = UUID.randomUUID().toString();
                        waitlistedAttendee.setTicketUuid(uuid);
                        waitlistedAttendee.setQrCodeBase64(qrCodeService.generateQRCodeBase64(uuid));
                        Attendee promoted = attendeeRepository.save(waitlistedAttendee);

                        Event event = promoted.getEvent();
                        if (isPaidEvent(event)) {
                            createPayment(promoted, event);
                        }
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