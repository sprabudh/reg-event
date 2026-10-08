import { useCallback, useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEventById, getEventStats } from '../services/eventService';
import { getAttendeesByEvent, registerAttendee, deleteAttendee, checkInAttendee, getEventPayments } from '../services/attendeeService';
import { approveEvent, rejectEvent } from '../services/hostService';
import { getUserRole } from '../services/authService';
import Field from '../components/ui/Field';
import Pagination from '../components/ui/Pagination';
import EventInfoGrid from '../components/event/EventInfoGrid';
import EventStats from '../components/event/EventStats';
import AttendeesTable from '../components/event/AttendeesTable';
import RefundsTable from '../components/event/RefundsTable';
import { useConfirm } from '../hooks/useConfirm';
import {
    APP_ROUTES,
    CONFIRM_LABELS,
    EMPTY_EVENT_STATS,
    ERROR_MESSAGES,
    FORM_LABELS,
    MOBILE_REGEX,
    PAGINATION,
    PROMPTS,
    REGISTRATION_STATUS,
    REGEX,
    ROLES,
    SUCCESS_MESSAGES,
    buildEditAttendeePath,
    getApprovalBadgeClass,
    getAttendeeStatusClass
} from '../constants';
import { getErrorMessage } from '../utils/errors';
import { formatHostName } from '../utils/format';
import { indexPaymentsByAttendee, selectCancelledPayments } from '../utils/payments';
import { filterAndSortAttendees } from '../utils/attendees';

const EventDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [stats, setStats] = useState(EMPTY_EVENT_STATS);

    const [registerError, setRegisterError] = useState('');
    const [registerSuccess, setRegisterSuccess] = useState('');
    const [actionError, setActionError] = useState('');
    const [actionSuccess, setActionSuccess] = useState('');
    const [loadError, setLoadError] = useState('');
    // stats starts at EMPTY_EVENT_STATS (available: 0), so before/without stats
    // the button would read "Join Waitlist" even for an empty event.
    const [statsLoaded, setStatsLoaded] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const [formData, setFormData] = useState({ name: '', email: '', mobileNumber: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [payments, setPayments] = useState([]);
    // The attendees endpoint is paged; without a pager the table silently showed
    // only the first LARGE_PAGE_SIZE rows of a larger event.
    const [attendeePage, setAttendeePage] = useState(0);
    const [attendeeTotalPages, setAttendeeTotalPages] = useState(0);
    const [busyAttendeeIds, setBusyAttendeeIds] = useState([]);

    const userRole = getUserRole();
    const isAdmin = userRole === ROLES.ADMIN;
    const confirm = useConfirm();

    // useCallback so the effect below can depend on them honestly. Without it the
// loader identities change every render, and the effect either loops or has to
// suppress the dependency.
const loadEventDetails = useCallback(() => {
        // A failed load leaves event === null, so without this the page would sit
        // on "Loading..." forever with no way out.
        getEventById(id)
            .then(res => { setEvent(res.data); setLoadError(''); })
            .catch(err => setLoadError(getErrorMessage(err, ERROR_MESSAGES.LOAD_EVENT_DETAILS_FAILED)));
    }, [id]);

    const loadEventStats = useCallback(() => {
        getEventStats(id)
            .then(res => { setStats(res.data); setStatsLoaded(true); })
            .catch(err => console.error(err));
    }, [id]);

    const loadAttendees = useCallback(() => {
        getAttendeesByEvent(id, attendeePage, PAGINATION.ATTENDEES_PAGE_SIZE)
            .then(res => {
                setAttendees(res.data.content || []);
                setAttendeeTotalPages(res.data.totalPages || 0);
            })
            .catch(err => console.error(err));
    }, [id, attendeePage]);

    const loadPayments = useCallback(() => {
        if (!isAdmin) return;
        getEventPayments(id).then(res => setPayments(res.data)).catch(err => console.error(err));
    }, [id, isAdmin]);

    const reloadAttendeeData = useCallback(() => {
        loadAttendees();
        loadEventStats();
        loadPayments();
    }, [loadAttendees, loadEventStats, loadPayments]);

    const reloadAll = useCallback(() => {
        loadEventDetails();
        reloadAttendeeData();
    }, [loadEventDetails, reloadAttendeeData]);

    useEffect(() => {
        reloadAll();
    }, [reloadAll]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear a stale validation error as soon as the user starts fixing it.
        if (registerError) setRegisterError('');
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (isRegistering) return;
        setRegisterError('');
        setRegisterSuccess('');
        setActionError('');
        setActionSuccess('');

        // Custom UI validations replacing browser default popups
        if (!formData.name.trim()) {
            setRegisterError('Full name is required.');
            return;
        }

        if (!formData.mobileNumber.trim()) {
            setRegisterError('Mobile number is required.');
            return;
        }

        if (!MOBILE_REGEX.test(formData.mobileNumber || '')) {
            setRegisterError(ERROR_MESSAGES.MOBILE_INVALID);
            return;
        }

        if (!formData.email.trim()) {
            setRegisterError('Email address is required.');
            return;
        }

        // Shared regex so "valid email" has a single definition
        if (!REGEX.EMAIL.test(formData.email)) {
            setRegisterError(ERROR_MESSAGES.EMAIL_FORMAT);
            return;
        }

        setIsRegistering(true);
        registerAttendee(id, formData)
            .then((res) => {
                if (res.data && res.data.status === REGISTRATION_STATUS.WAITLISTED) {
                    setRegisterSuccess(SUCCESS_MESSAGES.WAITLIST_OK);
                } else {
                    setRegisterSuccess(SUCCESS_MESSAGES.REGISTER_OK);
                }
                setFormData({ name: '', email: '', mobileNumber: '' });
                reloadAll();
            })
            .catch((err) => {
                setRegisterError(getErrorMessage(err, ERROR_MESSAGES.ATTENDEE_REGISTRATION_FAILED));
            })
            .finally(() => setIsRegistering(false));
    };

    const handleApprove = async () => {
        setActionError('');
        setActionSuccess('');
        const ok = await confirm({
            message: 'Approve this event? It becomes visible to attendees immediately.',
            confirmLabel: 'Approve'
        });
        if (!ok) return;

        approveEvent(id)
            .then(() => {
                setActionSuccess('Event approved and published to catalog.');
                reloadAll();
            })
            .catch((err) => setActionError(getErrorMessage(err, 'Failed to approve event.')));
    };

    const handleReject = async () => {
        setActionError('');
        setActionSuccess('');
        const ok = await confirm({
            message: `Reject "${event?.name}"? It will not be visible to attendees.`,
            confirmLabel: 'Reject',
            tone: 'danger'
        });
        if (!ok) return;

        rejectEvent(id, 'Rejected by admin')
            .then(() => navigate(APP_ROUTES.ADMIN_APPROVALS))
            .catch((err) => setActionError(getErrorMessage(err, 'Failed to reject event.')));
    };

    const markAttendeeBusy = (attendeeId, busy) => {
        setBusyAttendeeIds((prev) => (busy ? [...new Set([...prev, attendeeId])] : prev.filter((x) => x !== attendeeId)));
    };

    const handleDeleteAttendee = async (attendeeId) => {
        setActionError('');
        setActionSuccess('');
        const isPaid = event && event.price && event.price > 0;
        const actionText = isAdmin ? PROMPTS.REMOVE_ATTENDEE : PROMPTS.CANCEL_REGISTRATION;

        let message = actionText;
        if (isPaid) {
            message = event.isRefundable
                ? `Your ₹${event.price} fee will be refunded within 3 working days. ${actionText}`
                : `This is a NON-REFUNDABLE event. Your ₹${event.price} fee will NOT be refunded. ${actionText}`;
        }

        const confirmed = await confirm({
            message,
            confirmLabel: isAdmin ? CONFIRM_LABELS.REMOVE_ATTENDEE : CONFIRM_LABELS.CANCEL_REGISTRATION,
            tone: 'danger'
        });
        if (!confirmed) return;

        markAttendeeBusy(attendeeId, true);
        deleteAttendee(attendeeId)
            .then(() => {
                reloadAll();
                setActionSuccess(SUCCESS_MESSAGES.REGISTRATION_REMOVED);
            })
            .catch((err) => setActionError(getErrorMessage(err, ERROR_MESSAGES.CANCEL_REGISTRATION_FAILED)))
            .finally(() => markAttendeeBusy(attendeeId, false));
    };

    const handleCheckIn = (attendee) => {
        setActionError('');
        setActionSuccess('');

        if (!attendee.ticketUuid) {
            setActionError(ERROR_MESSAGES.LEGACY_TICKET_NO_UUID);
            return;
        }

        markAttendeeBusy(attendee.id, true);
        checkInAttendee(id, attendee.ticketUuid)
            .then(() => {
                setActionSuccess(SUCCESS_MESSAGES.CHECK_IN_OK(attendee.name));
                reloadAttendeeData();
            })
            .catch(err => setActionError(getErrorMessage(err, ERROR_MESSAGES.CHECK_IN_FAILED)))
            .finally(() => markAttendeeBusy(attendee.id, false));
    };

    if (!event) {
        if (loadError) {
            return (
                <div>
                    <Link to={APP_ROUTES.EVENTS} className="ed-back-link">&larr; Back to Events</Link>
                    <div className="card ed-event-card">
                        <div className="ed-error" role="alert">{loadError}</div>
                        <button type="button" className="btn btn-secondary" onClick={loadEventDetails}>Try Again</button>
                    </div>
                </div>
            );
        }
        return <div className="ed-loading">Loading...</div>;
    }

    const expired = event.expired;
    const isPending = event.approvalStatus === 'PENDING';
    const isRejected = event.approvalStatus === 'REJECTED';

    const paymentByAttendee = indexPaymentsByAttendee(payments);
    const cancelledPayments = selectCancelledPayments(payments);

    // Admins manage registrations from the table below; they should never be able
// to register themselves for an event from the admin view.
const alreadyRegistered = !isAdmin && attendees.length > 0;
const canRegister = !isAdmin && !alreadyRegistered;

    const sortedAttendees = filterAndSortAttendees(attendees, searchTerm);

    return (
        <div>
            <Link
                to={isAdmin && isPending ? APP_ROUTES.ADMIN_APPROVALS : APP_ROUTES.EVENTS}
                className="ed-back-link"
            >
                &larr; {isAdmin && isPending ? 'Back to Approvals' : 'Back to Events'}
            </Link>

            <div className="card ed-event-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <h2 className="ed-event-title" style={{ marginBottom: 0 }}>
                        {event.name}
                        {isAdmin && event.approvalStatus && (
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

                    {isAdmin && isPending && (
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={handleApprove} className="btn">
                                Approve Event
                            </button>
                            <button onClick={handleReject} className="btn btn-danger">
                                Reject Event
                            </button>
                        </div>
                    )}
                </div>

                <EventInfoGrid event={event} hostDisplay={formatHostName(event.hostName)} />
            </div>

            <EventStats stats={stats} />

            <div className="ed-main-row">
                {isPending || isRejected ? (
                    <div className="ed-panel">
                        {/* Approve/Reject live only in this branch, so their
                            feedback has to render here too — otherwise a failed
                            approval is silently swallowed. */}
                        {actionError && <div className="ed-error" role="alert">{actionError}</div>}
                        {actionSuccess && <div className="ed-success" role="status">{actionSuccess}</div>}

                        <h3 className="ed-panel-title">
                            {isPending ? 'Pending Admin Approval' : 'Event Rejected'}
                        </h3>
                        <p className="ed-panel-text">
                            {isPending
                                ? 'This event request is currently awaiting Admin approval. Attendee registrations will open automatically once approved.'
                                : 'This event request was rejected and is not open for registrations.'}
                        </p>
                    </div>
                ) : expired && !isAdmin ? (
                    <div className="ed-panel">
                        <h3 className="ed-panel-title">This event has ended</h3>
                        <p className="ed-panel-text">
                            No new registrations are accepted for this event. Your tickets, if any, remain available under <strong>My Tickets</strong>.
                        </p>
                    </div>
                ) : (
                    <>
                        {canRegister && (
                            <div className="card ed-register-card">
                                <h3 className="ed-register-title">Register</h3>

                                <form onSubmit={handleRegister} className="ed-form" noValidate>
                                    <Field variant="ed" label={FORM_LABELS.FULL_NAME} name="name" value={formData.name} onChange={handleInputChange} />

                                    <Field variant="ed" label={FORM_LABELS.MOBILE_NUMBER} type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="10-digit mobile number" />

                                    <Field variant="ed" label={FORM_LABELS.EMAIL} type="email" name="email" value={formData.email} onChange={handleInputChange} />

                                    <button
                                        type="submit"
                                        disabled={isRegistering}
                                        className={statsLoaded && stats.available === 0 ? 'btn ed-btn-waitlist' : 'btn ed-btn-register'}
                                    >
                                        {isRegistering
                                            ? 'Registering...'
                                            : statsLoaded && stats.available > 0
                                                ? 'Register Now'
                                                : statsLoaded
                                                    ? 'Join Waitlist'
                                                    : 'Checking availability...'}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="ed-main-col">
                            {/* Registration feedback lives here rather than inside
                                the register card: a successful registration makes
                                alreadyRegistered true, which unmounts that card and
                                would take its own success banner with it. */}
                            {registerError && <div className="ed-error" role="alert">{registerError}</div>}
                            {registerSuccess && <div className="ed-success" role="status">{registerSuccess}</div>}

                            {isAdmin ? (
                                <>
                                    {actionError && <div className="ed-error" role="alert">{actionError}</div>}
                                    {actionSuccess && <div className="ed-success" role="status">{actionSuccess}</div>}

                                    <AttendeesTable
                                        title="All Attendees (Admin View)"
                                        attendees={sortedAttendees}
                                        event={event}
                                        searchTerm={searchTerm}
                                        onSearch={setSearchTerm}
                                        paymentByAttendee={paymentByAttendee}
                                        onCheckIn={handleCheckIn}
                                        onDelete={(a) => handleDeleteAttendee(a.id)}
                                        busyIds={busyAttendeeIds}
                                    />

                                    <Pagination
                                        page={attendeePage}
                                        totalPages={attendeeTotalPages}
                                        onChange={setAttendeePage}
                                    />

                                    <RefundsTable cancelledPayments={cancelledPayments} />
                                </>
                            ) : (
                                <div className="ed-box">
                                    {actionError && <div className="ed-error" role="alert">{actionError}</div>}
                                    {actionSuccess && <div className="ed-success" role="status">{actionSuccess}</div>}

                                    <h3 className="ed-h3-dark">My Registration Status</h3>
                                    {attendees.length > 0 ? (
                                        <div className="ed-col">
                                            <p className="ed-p16">Your current status for this event is:
                                                <span className={`ed-status-inline ${getAttendeeStatusClass(attendees[0].status)}`}>
                                            {attendees[0].status || REGISTRATION_STATUS.CONFIRMED}
                                        </span>
                                            </p>

                                            {event.price > 0 && (
                                                <p className="ed-p14">
                                                    <strong>Amount Paid:</strong> ₹{event.price}{' '}
                                                    <span className={`ed-refund-badge ed-ml ${event.isRefundable ? 'ed-refundable' : 'ed-nonrefundable'}`}>
                                                {event.isRefundable ? 'Refundable' : 'Non-refundable'}
                                            </span>
                                                </p>
                                            )}

                                            {attendees[0].qrCodeBase64 && (
                                                <div className="ed-ticket-box">
                                                    <h4 className="ed-ticket-h4">Your Entry Ticket</h4>
                                                    <img src={attendees[0].qrCodeBase64} alt="QR Code Ticket" className="ed-qr" />
                                                    <p className="ed-ticket-id">
                                                        ID: {attendees[0].ticketUuid}
                                                    </p>
                                                </div>
                                            )}

                                            {attendees[0].status !== REGISTRATION_STATUS.CHECKED_IN && (
                                                <div className="ed-actions-row">
                                                    <Link
                                                        to={buildEditAttendeePath(attendees[0].id)}
                                                        className="ed-btn-edit"
                                                    >
                                                        Edit My Registration
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteAttendee(attendees[0].id)}
                                                        className="ed-btn-cancel"
                                                    >
                                                        Cancel My Registration
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="ed-muted-lg">You have not registered for this event yet. Use the form to secure your spot or join the waitlist.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default EventDetails;