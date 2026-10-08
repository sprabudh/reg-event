import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
    getMyEventById,
    getMyEventAttendees,
    getMyEventPayments,
    checkInMyAttendee,
    cancelMyAttendee
} from '../services/hostService';
import { getEventStats } from '../services/eventService';
import { useConfirm } from '../hooks/useConfirm';
import useFlash from '../hooks/useFlash';
import Pagination from '../components/ui/Pagination';
import EventInfoGrid from '../components/event/EventInfoGrid';
import EventStats from '../components/event/EventStats';
import AttendeesTable from '../components/event/AttendeesTable';
import RefundsTable from '../components/event/RefundsTable';
import {
    APP_ROUTES,
    APPROVAL_STATUS,
    CONFIRM_LABELS,
    EMPTY_EVENT_STATS,
    ERROR_MESSAGES,
    PAGINATION,
    PROMPTS,
    SUCCESS_MESSAGES,
    getApprovalBadgeClass
} from '../constants';
import { getErrorMessage } from '../utils/errors';
import { formatHostName } from '../utils/format';
import { indexPaymentsByAttendee, selectCancelledPayments } from '../utils/payments';
import { filterAndSortAttendees } from '../utils/attendees';

const HostEventDetail = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [stats, setStats] = useState(EMPTY_EVENT_STATS);
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    // Attendees are a paged endpoint; without a pager the table only showed the
    // first page of a large event.
    const [attendeePage, setAttendeePage] = useState(0);
    const [attendeeTotalPages, setAttendeeTotalPages] = useState(0);
    const [busyAttendeeIds, setBusyAttendeeIds] = useState([]);
    const [error, setError] = useState('');
    const [success, flash, clearSuccess] = useFlash();
    const confirm = useConfirm();

    const load = useCallback(() => {
        getMyEventById(id)
            .then((res) => {
                const ev = res.data;
                setEvent(ev);

                if (!ev.approvalStatus || ev.approvalStatus === APPROVAL_STATUS.APPROVED) {
                    getMyEventAttendees(id, attendeePage, PAGINATION.ATTENDEES_PAGE_SIZE)
                        .then((aRes) => {
                            setAttendees(aRes.data.content || []);
                            setAttendeeTotalPages(aRes.data.totalPages || 0);
                        })
                        .catch((err) => setError(getErrorMessage(err, 'Failed to load attendees.')));

                    // Payments/stats failures were swallowed entirely, so the Refunds
                    // table and the counters could just look legitimately empty.
                    getMyEventPayments(id)
                        .then((pRes) => setPayments(pRes.data || []))
                        .catch(() => setError('Could not load refund records for this event.'));
                }
            })
            .catch((err) => setError(getErrorMessage(err, 'Failed to load your event.')));

        getEventStats(id)
            .then((sRes) => setStats(sRes.data))
            .catch(() => setError('Could not load registration counts for this event.'));
    }, [id, attendeePage]);

    useEffect(() => { load(); }, [load]);

    const markAttendeeBusy = (attendeeId, busy) => {
        setBusyAttendeeIds((prev) => (busy ? [...new Set([...prev, attendeeId])] : prev.filter((x) => x !== attendeeId)));
    };

    const handleCheckIn = (attendee) => {
        setError('');
        clearSuccess();

        if (!attendee.ticketUuid) {
            setError(ERROR_MESSAGES.LEGACY_TICKET_NO_UUID);
            return;
        }

        markAttendeeBusy(attendee.id, true);
        checkInMyAttendee(id, attendee.ticketUuid)
            .then(() => {
                flash(SUCCESS_MESSAGES.CHECK_IN_OK(attendee.name));
                load();
            })
            .catch((err) => setError(getErrorMessage(err, ERROR_MESSAGES.CHECK_IN_FAILED)))
            .finally(() => markAttendeeBusy(attendee.id, false));
    };

    const handleDeleteAttendee = async (attendee) => {
        setError('');
        clearSuccess();

        const isPaid = event && event.price && event.price > 0;
        let message = PROMPTS.REMOVE_ATTENDEE;
        if (isPaid) {
            message = event.isRefundable
                ? `Your ₹${event.price} fee will be refunded within 3 working days. ${PROMPTS.REMOVE_ATTENDEE}`
                : `This is a NON-REFUNDABLE event. Your ₹${event.price} fee will NOT be refunded. ${PROMPTS.REMOVE_ATTENDEE}`;
        }

        const confirmed = await confirm({
            message,
            confirmLabel: CONFIRM_LABELS.REMOVE_ATTENDEE,
            tone: 'danger'
        });
        if (!confirmed) return;

        markAttendeeBusy(attendee.id, true);
        cancelMyAttendee(attendee.id)
            .then(() => {
                flash(SUCCESS_MESSAGES.REGISTRATION_REMOVED);
                load();
            })
            // PROMPTS.REMOVE_ATTENDEE is the question "Remove this attendee?",
            // which read as nonsense when rendered in the error banner.
            .catch((err) => setError(getErrorMessage(err, ERROR_MESSAGES.CANCEL_REGISTRATION_FAILED)))
            .finally(() => markAttendeeBusy(attendee.id, false));
    };

    if (!event && !error) return <div className="ed-loading">Loading...</div>;

    const expired = event?.expired;
    const isPending = event?.approvalStatus === 'PENDING';
    const isRejected = event?.approvalStatus === 'REJECTED';

    const paymentByAttendee = indexPaymentsByAttendee(payments);
    const cancelledPayments = selectCancelledPayments(payments);

    const sortedAttendees = filterAndSortAttendees(attendees, searchTerm);

    return (
        <div>
            <Link to={APP_ROUTES.HOST_EVENTS} className="ed-back-link">&larr; Back to My Events</Link>

            {error && <div className="ed-error" role="alert">{error}</div>}
            {success && <div className="ed-success" role="status">{success}</div>}

            {event && (
                <>
                    <div className="card ed-event-card">
                        <h2 className="ed-event-title">
                            {event.name}
                            {event.approvalStatus && (
                                <span
                                    className={`badge-pill ${getApprovalBadgeClass(event.approvalStatus)}`}
                                    style={{ marginLeft: 12, padding: '4px 10px', verticalAlign: 'middle' }}
                                >
                                    {event.approvalStatus}
                                </span>
                            )}
                            {expired && (
                                <span className="ed-ended-badge">Event Ended</span>
                            )}
                        </h2>
                        <EventInfoGrid event={event} hostDisplay={formatHostName(event.hostName, 'Host')} />
                    </div>

                    <EventStats stats={stats} />

                    <div className="ed-main-row">
                        {isPending ? (
                            <div className="ed-panel">
                                <h3 className="ed-panel-title">Event Not Hosted Yet (Pending Admin Approval)</h3>
                                <p className="ed-panel-text">
                                    Your event request has been submitted and is currently awaiting approval from the Admin. Because this event is not hosted yet, attendee registrations, check-ins, and refund records will become available here automatically once the Admin approves it.
                                </p>
                            </div>
                        ) : isRejected ? (
                            <div className="ed-panel">
                                <h3 className="ed-panel-title">Event Request Not Approved</h3>
                                <p className="ed-panel-text">
                                    This event request was rejected by the Admin and has not been hosted on the platform.
                                    {event.rejectionReason ? ` Reason: ${event.rejectionReason}` : ''}
                                </p>
                            </div>
                        ) : (
                            <div className="ed-main-col">
                                <AttendeesTable
                                    title="All Attendees"
                                    attendees={sortedAttendees}
                                    event={event}
                                    searchTerm={searchTerm}
                                    onSearch={setSearchTerm}
                                    paymentByAttendee={paymentByAttendee}
                                    onCheckIn={handleCheckIn}
                                    onDelete={handleDeleteAttendee}
                                    busyIds={busyAttendeeIds}
                                />

                                <Pagination
                                    page={attendeePage}
                                    totalPages={attendeeTotalPages}
                                    onChange={setAttendeePage}
                                />

                                <RefundsTable cancelledPayments={cancelledPayments} />
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default HostEventDetail;