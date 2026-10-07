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
import {
    APP_ROUTES,
    CONFIRM_LABELS,
    ERROR_MESSAGES,
    PROMPTS,
    REFUND_STATUS,
    REGISTRATION_STATUS,
    SUCCESS_MESSAGES,
    TABLE_HEADERS,
    buildEditAttendeePath,
    getAttendeeBadgeClass
} from '../constants';
import { getErrorMessage } from '../utils/errors';

const APPROVAL_BADGE = { PENDING: 'bd-orange', APPROVED: 'bd-green', REJECTED: 'bd-indigo' };

const HostEventDetail = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [stats, setStats] = useState({ capacity: 0, registered: 0, available: 0 });
    const [payments, setPayments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const confirm = useConfirm();

    const load = useCallback(() => {
        getMyEventById(id)
            .then((res) => {
                const ev = res.data;
                setEvent(ev);

                if (!ev.approvalStatus || ev.approvalStatus === 'APPROVED') {
                    getMyEventAttendees(id)
                        .then((aRes) => setAttendees(aRes.data.content || []))
                        .catch((err) => setError(getErrorMessage(err, 'Failed to load attendees.')));

                    getMyEventPayments(id)
                        .then((pRes) => setPayments(pRes.data || []))
                        .catch(() => {});
                }
            })
            .catch((err) => setError(getErrorMessage(err, 'Failed to load your event.')));

        getEventStats(id)
            .then((sRes) => setStats(sRes.data))
            .catch(() => {});
    }, [id]);

    useEffect(() => { load(); }, [load]);

    const flash = (msg) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3000);
    };

    const handleCheckIn = (attendee) => {
        setError('');
        setSuccess('');

        if (!attendee.ticketUuid) {
            setError(ERROR_MESSAGES.LEGACY_TICKET_NO_UUID);
            return;
        }

        checkInMyAttendee(id, attendee.ticketUuid)
            .then(() => {
                flash(SUCCESS_MESSAGES.CHECK_IN_OK(attendee.name));
                load();
            })
            .catch((err) => setError(getErrorMessage(err, ERROR_MESSAGES.CHECK_IN_FAILED)));
    };

    const handleDeleteAttendee = async (attendee) => {
        setError('');
        setSuccess('');

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

        cancelMyAttendee(attendee.id)
            .then(() => {
                flash(SUCCESS_MESSAGES.REGISTRATION_REMOVED);
                load();
            })
            .catch((err) => setError(getErrorMessage(err, PROMPTS.REMOVE_ATTENDEE)));
    };

    if (!event && !error) return <div className="ed-loading">Loading...</div>;

    const expired = event?.expired;
    const isPending = event?.approvalStatus === 'PENDING';
    const isRejected = event?.approvalStatus === 'REJECTED';

    const paymentByAttendee = Object.fromEntries(payments.map((p) => [p.attendeeId, p]));
    const cancelledPayments = payments.filter(
        (p) => p.refundStatus === REFUND_STATUS.REFUNDED || p.refundStatus === REFUND_STATUS.FORFEITED || p.cancelledAt
    );

    const formatDateTime = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const refundBadge = (refundStatus) => {
        if (refundStatus === REFUND_STATUS.REFUNDED) return { label: 'Refunded', cls: 'ed-refunded' };
        if (refundStatus === REFUND_STATUS.FORFEITED) return { label: 'Forfeited', cls: 'ed-forfeited' };
        return null;
    };

    const filteredAttendees = attendees.filter(
        (a) =>
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedAttendees = [...filteredAttendees].sort((a, b) => {
        const statusA = a.status || REGISTRATION_STATUS.CONFIRMED;
        const statusB = b.status || REGISTRATION_STATUS.CONFIRMED;
        if (statusA === REGISTRATION_STATUS.CONFIRMED && statusB === REGISTRATION_STATUS.WAITLISTED) return -1;
        if (statusA === REGISTRATION_STATUS.WAITLISTED && statusB === REGISTRATION_STATUS.CONFIRMED) return 1;
        return 0;
    });

    return (
        <div>
            <Link to={APP_ROUTES.HOST_EVENTS} className="ed-back-link">&larr; Back to My Events</Link>

            {error && <div className="ed-error">{error}</div>}
            {success && <div className="ed-success">{success}</div>}

            {event && (
                <>
                    <div className="card ed-event-card">
                        <h2 className="ed-event-title">
                            {event.name}
                            {event.approvalStatus && (
                                <span
                                    className={`badge-pill ${APPROVAL_BADGE[event.approvalStatus] || 'bd-default'}`}
                                    style={{ marginLeft: 12, padding: '4px 10px', verticalAlign: 'middle' }}
                                >
                                    {event.approvalStatus}
                                </span>
                            )}
                            {expired && (
                                <span className="ed-ended-badge">Event Ended</span>
                            )}
                        </h2>
                        <div className="ed-info-grid">
                            <p className="ed-info-item"><strong>Hosted By:</strong> {event.hostName || 'Host'}</p>
                            <p className="ed-info-item"><strong>Category:</strong> {event.category ? event.category.name : 'N/A'}</p>
                            <p className="ed-info-item"><strong>Date:</strong> {event.date}</p>
                            <p className="ed-info-item"><strong>Time:</strong> {event.time || 'TBA'}</p>
                            <p className="ed-info-item"><strong>Duration:</strong> {event.duration ? (isNaN(event.duration) ? event.duration : `${event.duration} Hours`) : 'TBA'}</p>
                            <p className="ed-info-item"><strong>Price:</strong> {!event.price || event.price === 0 ? <span className="ed-text-green">Free</span> : `₹${event.price}`}</p>
                            {event.isOnline ? (
                                <p className="ed-info-item"><strong>Location:</strong> <span className="ed-text-blue">Online Event</span></p>
                            ) : (
                                <p className="ed-info-item"><strong>Location:</strong> {event.location || 'TBA'}</p>
                            )}
                            <p className="ed-info-item"><strong>Cancellation:</strong> {event.isRefundable ? 'Refund Available' : 'No Refund'}</p>
                        </div>
                    </div>

                    <div className="ed-stats-row">
                        <div className="ed-stat-card-purple">
                            <h4 className="ed-stat-h4">Total Registrations</h4>
                            <p className="ed-stat-value">{stats.registered} / {stats.capacity}</p>
                        </div>
                        <div className="ed-stat-card-green">
                            <h4 className="ed-stat-h4-green">Available Seats</h4>
                            <p className="ed-stat-value-green">{stats.available}</p>
                        </div>
                    </div>

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
                                <div className="ed-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                                    <h3 className="ed-h3-flush" style={{ margin: 0, whiteSpace: 'nowrap' }}>All Attendees</h3>
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="ed-search-input"
                                        style={{ flex: 1, maxWidth: '350px' }}
                                    />
                                </div>

                                {sortedAttendees.length === 0 ? (
                                    <p className="ed-muted">No attendees found.</p>
                                ) : (
                                    <table className="ed-table">
                                        <thead>
                                        <tr>
                                            {TABLE_HEADERS.ATTENDEES.map((header) => (
                                                <th key={header} className="ed-cell">{header}</th>
                                            ))}
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {sortedAttendees.map((a) => {
                                            const status = a.status || REGISTRATION_STATUS.CONFIRMED;
                                            const statusClass = getAttendeeBadgeClass(a.status);
                                            const isPaidEvent = event.price > 0;
                                            const hasPayment = !!paymentByAttendee[a.id];
                                            const paymentLabel = !isPaidEvent
                                                ? '—'
                                                : hasPayment
                                                    ? 'Paid'
                                                    : 'Pending';
                                            const paymentClass = !isPaidEvent
                                                ? 'ed-badge-slate'
                                                : hasPayment
                                                    ? 'ed-badge-green ed-badge-pay-xs'
                                                    : 'ed-badge-orange ed-badge-pay-xs';

                                            return (
                                                <tr key={a.id} className="ed-row">
                                                    <td className="ed-cell">{a.name}</td>
                                                    <td className="ed-cell">{a.email}</td>
                                                    <td className="ed-cell">
                                                            <span className={`ed-badge ${statusClass}`}>
                                                                {status}
                                                            </span>
                                                    </td>
                                                    <td className="ed-cell">
                                                        {paymentByAttendee[a.id] ? `₹${paymentByAttendee[a.id].amount}` : '—'}
                                                    </td>
                                                    <td className="ed-cell ed-td-mono">
                                                        {paymentByAttendee[a.id]?.invoiceNo || '—'}
                                                    </td>
                                                    <td className="ed-cell">
                                                        <span className={`ed-badge ${paymentClass}`}>{paymentLabel}</span>
                                                    </td>
                                                    <td className="ed-cell ed-td-actions">
                                                        {a.status === REGISTRATION_STATUS.CONFIRMED && (
                                                            <button
                                                                onClick={() => handleCheckIn(a)}
                                                                disabled={!a.ticketUuid}
                                                                title={!a.ticketUuid ? 'Legacy User: No Ticket UUID' : 'Check In Attendee'}
                                                                className={a.ticketUuid ? 'ed-btn-checkin ed-btn-checkin-on' : 'ed-btn-checkin ed-btn-checkin-off'}
                                                            >
                                                                Check In
                                                            </button>
                                                        )}
                                                        <Link to={buildEditAttendeePath(a.id)} className="btn btn-small btn-secondary ed-btn-xs">
                                                            Edit
                                                        </Link>
                                                        <button onClick={() => handleDeleteAttendee(a)} className="btn btn-small btn-danger ed-btn-xs">
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        </tbody>
                                    </table>
                                )}

                                <div className="ed-refunds">
                                    <h3 className="ed-h3">Refunds</h3>
                                    {cancelledPayments.length > 0 && (
                                        <p className="ed-cancel-note">
                                            {cancelledPayments.length} cancelled registration(s): refundable events are marked <strong>Refunded</strong>, non-refundable cancellations are <strong>Forfeited</strong>, and free cancellations show <strong>No Refund (Free)</strong>.
                                        </p>
                                    )}
                                    {cancelledPayments.length === 0 ? (
                                        <p className="ed-muted">No cancellations for this event yet.</p>
                                    ) : (
                                        <table className="ed-table">
                                            <thead>
                                            <tr>
                                                {TABLE_HEADERS.REFUNDS.map((header) => (
                                                    <th key={header} className="ed-cell">{header}</th>
                                                ))}
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {cancelledPayments.map((p) => {
                                                const r = refundBadge(p.refundStatus);
                                                const status = r || (p.amount === 0
                                                    ? { label: 'No Refund (Free)', cls: 'ed-free-cancel' }
                                                    : { label: 'Cancelled', cls: 'ed-cancelled' });
                                                return (
                                                    <tr key={p.id} className="ed-row">
                                                        <td className="ed-cell">{p.attendeeName || '—'}</td>
                                                        <td className="ed-cell">{p.amount === 0 ? 'Free' : `₹${p.amount}`}</td>
                                                        <td className="ed-cell ed-td-mono">{p.invoiceNo}</td>
                                                        <td className="ed-cell">{formatDateTime(p.paidAt)}</td>
                                                        <td className="ed-cell">
                                                            <span className={`ed-refund-badge ${status.cls}`}>{status.label}</span>
                                                        </td>
                                                        <td className="ed-cell">{formatDateTime(p.cancelledAt)}</td>
                                                    </tr>
                                                );
                                            })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default HostEventDetail;