package com.example.eventreg.entity;

/**
 * Whether an event has cleared admin review.
 *
 * Only APPROVED (and legacy NULL) rows are visible to attendees; PENDING and
 * REJECTED exist so a host can track their own submissions.
 */
public enum ApprovalStatus {
    PENDING,
    APPROVED,
    REJECTED
}