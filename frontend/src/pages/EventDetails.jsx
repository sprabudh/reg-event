import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getEventById, getEventStats } from '../services/eventService';
import { getAttendeesByEvent, registerAttendee, deleteAttendee, checkInAttendee, getEventPayments } from '../services/attendeeService';
import { approveEvent, rejectEvent } from '../services/hostService';
import { getUserRole } from '../services/authService';
import Field from '../components/ui/Field';
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

    const [formData, setFormData] = useState({ name: '', email: '', mobileNumber: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [payments, setPayments] = useState([]);

    const userRole = getUserRole();
    const isAdmin = userRole === ROLES.ADMIN;
    const confirm = useConfirm();

    const loadEventDetails = () => {
        getEventById(id).then(res => setEvent(res.data)).catch(err => console.error(err));
    };

    const loadEventStats = () => {
        getEventStats(id).then(res => setStats(res.data)).catch(err => console.error(err));
    };

    const loadAttendees = () => {
        getAttendeesByEvent(id, PAGINATION.DEFAULT_PAGE, PAGINATION.LARGE_PAGE_SIZE)
            .then(res => setAttendees(res.data.content))
            .catch(err => console.error(err));
    };

    const loadPayments = () => {
        if (!isAdmin) return;
        getEventPayments(id).then(res => setPayments(res.data)).catch(err => console.error(err));
    };

    const reloadAttendeeData = () => {
        loadAttendees();
        loadEventStats();
        loadPayments();
    };

    const reloadAll = () => {
        loadEventDetails();
        reloadAttendeeData();
    };

    useEffect(() => {
        reloadAll();
    }, [id]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = (e) => {
        e.preventDefault();
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

        // Simple standard email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setRegisterError('Please enter a valid email address.');
            return;
        }

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
            });
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

        deleteAttendee(attendeeId).then(() => {
            reloadAll();
            setActionSuccess(SUCCESS_MESSAGES.REGISTRATION_REMOVED);
        }).catch((err) => setActionError(getErrorMessage(err, 'Failed to cancel registration.')));
    };

    const handleCheckIn = (attendee) => {
        setActionError('');
        setActionSuccess('');

        if (!attendee.ticketUuid) {
            setActionError(ERROR_MESSAGES.LEGACY_TICKET_NO_UUID);
            return;
        }

        checkInAttendee(id, attendee.ticketUuid)
            .then(() => {
                setActionSuccess(SUCCESS_MESSAGES.CHECK_IN_OK(attendee.name));
                reloadAttendeeData();
            })
            .catch(err => setActionError(getErrorMessage(err, ERROR_MESSAGES.CHECK_IN_FAILED)));
    };

    if (!event) return <div className="ed-loading">Loading...</div>;

    const expired = event.expired;
    const isPending = event.approvalStatus === 'PENDING';
    const isRejected = event.approvalStatus === 'REJECTED';

    const paymentByAttendee = indexPaymentsByAttendee(payments);
    const cancelledPayments = selectCancelledPayments(payments);

    const alreadyRegistered = !isAdmin && attendees.length > 0;

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
                        {!alreadyRegistered && (
                            <div className="card ed-register-card">
                                <h3 className="ed-register-title">Register</h3>

                                {registerError && <div className="ed-error">{registerError}</div>}
                                {registerSuccess && <div className="ed-success">{registerSuccess}</div>}

                                <form onSubmit={handleRegister} className="ed-form" noValidate>
                                    <Field variant="ed" label={FORM_LABELS.FULL_NAME} name="name" value={formData.name} onChange={handleInputChange} />

                                    <Field variant="ed" label={FORM_LABELS.MOBILE_NUMBER} type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="10-digit mobile number" />

                                    <Field variant="ed" label={FORM_LABELS.EMAIL} type="email" name="email" value={formData.email} onChange={handleInputChange} />

                                    <button type="submit" className={stats.available === 0 ? 'btn ed-btn-waitlist' : 'btn ed-btn-register'}>
                                        {stats.available > 0 ? 'Register Now' : 'Join Waitlist'}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="ed-main-col">
                            {isAdmin ? (
                                <>
                                    {actionError && <div className="ed-error">{actionError}</div>}
                                    {actionSuccess && <div className="ed-success">{actionSuccess}</div>}

                                    <AttendeesTable
                                        title="All Attendees (Admin View)"
                                        attendees={sortedAttendees}
                                        event={event}
                                        searchTerm={searchTerm}
                                        onSearch={setSearchTerm}
                                        paymentByAttendee={paymentByAttendee}
                                        onCheckIn={handleCheckIn}
                                        onDelete={(a) => handleDeleteAttendee(a.id)}
                                    />

                                    <RefundsTable cancelledPayments={cancelledPayments} />
                                </>
                            ) : (
                                <div className="ed-box">
                                    {actionError && <div className="ed-error">{actionError}</div>}
                                    {actionSuccess && <div className="ed-success">{actionSuccess}</div>}

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