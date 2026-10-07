import { REFUND_STATUS } from '../constants';

/**
 * Payment/refund helpers shared by the event detail pages.
 */

/**
 * Maps a refund status to its display pill. Returns null for statuses that
 * have no badge (callers then fall back to their own "Cancelled"/"No Refund"
 * labels).
 */
export const getRefundBadge = (refundStatus) => {
    if (refundStatus === REFUND_STATUS.REFUNDED) return { label: 'Refunded', cls: 'ed-refunded' };
    if (refundStatus === REFUND_STATUS.FORFEITED) return { label: 'Forfeited', cls: 'ed-forfeited' };
    return null;
};

/** Indexes a payments list by attendeeId for O(1) lookup in the attendee table. */
export const indexPaymentsByAttendee = (payments) =>
    Object.fromEntries(payments.map((p) => [p.attendeeId, p]));

/** Payments that represent a cancelled registration (refunded, forfeited, or flagged cancelled). */
export const selectCancelledPayments = (payments) =>
    payments.filter(
        (p) => p.refundStatus === REFUND_STATUS.REFUNDED || p.refundStatus === REFUND_STATUS.FORFEITED || p.cancelledAt
    );
