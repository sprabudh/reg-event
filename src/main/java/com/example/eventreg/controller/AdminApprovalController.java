package com.example.eventreg.controller;

import com.example.eventreg.entity.ApprovalStatus;
import com.example.eventreg.entity.Event;
import com.example.eventreg.user.UserRepository;
import com.example.eventreg.service.EventService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

/**
 * Admin review queue for host-submitted events.
 *
 * Categories deliberately have NO queue here. Categories stay admin-owned:
 * an admin maintains the full list in ManageCategories, and a host simply
 * picks the best fit from that same list when submitting an event (with an
 * "Other" option for anything that does not fit). No category_request table,
 * no extra endpoints, and the host can submit an event in one step.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminApprovalController {

    private final EventService eventService;
    private final UserRepository userRepository;

    public AdminApprovalController(EventService eventService, UserRepository userRepository) {
        this.eventService = eventService;
        this.userRepository = userRepository;
    }

    private Long adminId(Principal principal) {
        return userRepository.findByEmail(principal.getName()).map(u -> u.getId()).orElse(null);
    }

    @GetMapping("/approvals/events")
    public ResponseEntity<Page<Event>> pendingEvents(
            @RequestParam(required = false) ApprovalStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        ApprovalStatus target = status == null ? ApprovalStatus.PENDING : status;
        return ResponseEntity.ok(eventService.getEventsByApprovalStatus(target, PageRequest.of(page, size)));
    }

    @PostMapping("/approvals/events/{id}/approve")
    public ResponseEntity<Event> approveEvent(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(eventService.approveEvent(id, adminId(principal)));
    }

    @PostMapping("/approvals/events/{id}/reject")
    public ResponseEntity<Event> rejectEvent(@PathVariable Long id,
                                             @RequestBody(required = false) Map<String, String> body,
                                             Principal principal) {
        String reason = body == null ? null : body.get("reason");
        return ResponseEntity.ok(eventService.rejectEvent(id, adminId(principal), reason));
    }

    /** Badge count for the admin nav. */
    @GetMapping("/approvals/counts")
    public ResponseEntity<Map<String, Long>> counts() {
        return ResponseEntity.ok(Map.of("events", eventService.countByApprovalStatus(ApprovalStatus.PENDING)));
    }
}