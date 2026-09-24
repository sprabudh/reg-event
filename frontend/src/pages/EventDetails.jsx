import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById, getEventStats } from '../services/eventService';
import { getAttendeesByEvent, registerAttendee, deleteAttendee, checkInAttendee, getEventPayments } from '../services/attendeeService';
import { getUserRole } from '../services/authService';

const EventDetails = () => {
    const { id } = useParams();

    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [stats, setStats] = useState({ capacity: 0, registered: 0, available: 0 });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', mobileNumber: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [payments, setPayments] = useState([]);

    const userRole = getUserRole();

    const loadEventDetails = () => {
        getEventById(id).then(res => setEvent(res.data)).catch(err => console.error(err));
    };

    const loadEventStats = () => {
        getEventStats(id).then(res => setStats(res.data)).catch(err => console.error(err));
    };

    const loadAttendees = () => {
        getAttendeesByEvent(id, 0, 100).then(res => setAttendees(res.data.content)).catch(err => console.error(err));
    };

    const loadPayments = () => {
        if (userRole !== 'ADMIN') return;
        getEventPayments(id).then(res => setPayments(res.data)).catch(err => console.error(err));
    };

    useEffect(() => {
        loadEventDetails();
        loadAttendees();
        loadEventStats();
        loadPayments();
    }, [id]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!/^\d{10}$/.test(formData.mobileNumber || '')) {
            setError('Mobile number must be exactly 10 digits.');
            return;
        }

        registerAttendee(id, formData)
            .then((res) => {
                if (res.data && res.data.status === 'WAITLISTED') {
                    setSuccess('Event is full. You have been added to the waitlist!');
                } else {
                    setSuccess('Successfully registered! Your ticket has been generated.');
                }
                setFormData({ name: '', email: '' });
                loadEventDetails();
                loadAttendees();
                loadEventStats();
                loadPayments();
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
            });
    };

    const handleDeleteAttendee = (attendeeId) => {
        const isPaid = event && event.price && event.price > 0;
        const actionText = userRole === 'ADMIN' ? "Remove this attendee?" : "Cancel your registration?";

        let message = actionText;
        if (isPaid) {
            message = event.isRefundable
                ? `Your ₹${event.price} fee will be refunded within 3 working days. ${actionText}`
                : `This is a NON-REFUNDABLE event. Your ₹${event.price} fee will NOT be refunded. ${actionText}`;
        }

        if (window.confirm(message)) {
            deleteAttendee(attendeeId).then(() => {
                loadEventDetails();
                loadAttendees();
                loadEventStats();
                loadPayments();
                setSuccess('Registration removed successfully.');
            }).catch(console.error);
        }
    };

    // FIX: Safely handle the check-in process
    const handleCheckIn = (attendee) => {
        setError('');
        setSuccess('');

        // Prevent crash if it's a legacy user without a ticket UUID
        if (!attendee.ticketUuid) {
            setError('Check-in failed: This attendee was registered before the ticketing system was added and has no valid ticket ID.');
            return;
        }

        checkInAttendee(id, attendee.ticketUuid)
            .then(() => {
                setSuccess(`${attendee.name} has been successfully checked in!`);
                loadAttendees();
                loadEventStats();
                loadPayments();
            })
            .catch(err => setError(err.response?.data?.message || 'Check-in failed. Please try again.'));
    };

    if (!event) return <div className="ed-loading">Loading...</div>;

    const expired = event.expired;

    const paymentByAttendee = Object.fromEntries(payments.map(p => [p.attendeeId, p]));
    const cancelledPayments = payments.filter(p => p.refundStatus === 'REFUNDED' || p.refundStatus === 'FORFEITED' || p.cancelledAt);

    const formatDateTime = (iso) => {
        if (!iso) return '—';
        const d = new Date(iso);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const refundBadge = (refundStatus) => {
        if (refundStatus === 'REFUNDED') return { label: 'Refunded', cls: 'ed-refunded' };
        if (refundStatus === 'FORFEITED') return { label: 'Forfeited', cls: 'ed-forfeited' };
        return null;
    };

    const alreadyRegistered = userRole !== 'ADMIN' && attendees.length > 0;

    const filteredAttendees = attendees.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedAttendees = [...filteredAttendees].sort((a, b) => {
        const statusA = a.status || 'CONFIRMED';
        const statusB = b.status || 'CONFIRMED';
        if (statusA === 'CONFIRMED' && statusB === 'WAITLISTED') return -1;
        if (statusA === 'WAITLISTED' && statusB === 'CONFIRMED') return 1;
        return 0;
    });

    return (
        <div>
            <Link to="/events" className="ed-back-link">← Back to Events</Link>

            <div className="card ed-event-card">
                <h2 className="ed-event-title">
                {event.name}
                {expired && (
                    <span className="ed-ended-badge">Event Ended</span>
                )}
            </h2>
                <div className="ed-info-grid">
                    <p className="ed-info-item"><strong>Date:</strong> {event.date}</p>
                    <p className="ed-info-item"><strong>Time:</strong> {event.time || 'TBA'}</p>
                    <p className="ed-info-item"><strong>Duration:</strong> {event.duration || 'TBA'}</p>
                    <p className="ed-info-item"><strong>Price:</strong> {!event.price || event.price === 0 ? <span className="ed-text-green">Free</span> : `₹${event.price}`}</p>                    {event.isOnline ? (
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

                {expired && userRole !== 'ADMIN' ? (
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

                    {error && <div className="ed-error">{error}</div>}
                    {success && <div className="ed-success">{success}</div>}

                    <form onSubmit={handleRegister} className="ed-form">
                        <div>
                            <label className="ed-label">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="ed-input" />
                        </div>

                        {/* NEW: Mobile Number Field */}
                        <div>
                            <label className="ed-label">Mobile Number</label>
                            <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required placeholder="10-digit mobile number" className="ed-input" />
                        </div>

                        <div>
                            <label className="ed-label">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="ed-input"/>
                        </div>
                        <button type="submit" className={stats.available === 0 ? 'btn ed-btn-waitlist' : 'btn ed-btn-register'}>
                            {stats.available > 0 ? 'Register Now' : 'Join Waitlist'}
                        </button>
                    </form>
                </div>
                )}

                <div className="ed-main-col">
                    {userRole === 'ADMIN' ? (
                        <>
                            <div className="ed-toolbar">
                                <h3 className="ed-h3-flush">All Attendees (Admin View)</h3>
                                <input type="text" placeholder="Search attendees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="ed-search-input" />
                            </div>

                            {sortedAttendees.length === 0 ? (
                                <p className="ed-muted">No attendees found.</p>
                            ) : (
                                <table className="ed-table">
                                    <thead>
                                    <tr>
                                        <th className="ed-cell">Name</th>
                                        <th className="ed-cell">Email</th>
                                        <th className="ed-cell">Status</th>
                                        <th className="ed-cell">Amount</th>
                                        <th className="ed-cell">Invoice</th>
                                        <th className="ed-cell">Payment</th>
                                        <th className="ed-cell">Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sortedAttendees.map(a => {
                                        // Visual handling for different statuses
                                        let statusClass = 'ed-badge-green'; // CONFIRMED
                                        if (a.status === 'WAITLISTED') {
                                            statusClass = 'ed-badge-orange';
                                        } else if (a.status === 'CHECKED_IN') {
                                            statusClass = 'ed-badge-indigo';
                                        }
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
                                                    {a.status || 'CONFIRMED'}
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
                                                {/* FIX: Cleaned up Action Buttons */}
                                                <td className="ed-cell ed-td-actions">
                                                    {a.status === 'CONFIRMED' && (
                                                        <button
                                                            onClick={() => handleCheckIn(a)}
                                                            disabled={!a.ticketUuid}
                                                            title={!a.ticketUuid ? "Legacy User: No Ticket UUID" : "Check In Attendee"}
                                                            className={a.ticketUuid ? 'ed-btn-checkin ed-btn-checkin-on' : 'ed-btn-checkin ed-btn-checkin-off'}>
                                                            Check In
                                                        </button>
                                                    )}
                                                    <Link to={`/edit-attendee/${a.id}`} className="btn btn-small btn-secondary ed-btn-xs">Edit</Link>
                                                    <button onClick={() => handleDeleteAttendee(a.id)} className="btn btn-small btn-danger ed-btn-xs">Delete</button>
                                                </td>
                                            </tr>
                                        )})}
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
                                            <th className="ed-cell">Attendee</th>
                                            <th className="ed-cell">Amount</th>
                                            <th className="ed-cell">Invoice</th>
                                            <th className="ed-cell">Date of Registration</th>
                                            <th className="ed-cell">Refund Status</th>
                                            <th className="ed-cell">Date of Cancellation</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                        {cancelledPayments.map(p => {
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
                        </>
                    ) : (
                        <div className="ed-box">
                            <h3 className="ed-h3-dark">My Registration Status</h3>
                            {attendees.length > 0 ? (
                                <div className="ed-col">
                                    <p className="ed-p16">Your current status for this event is:
                                        <span className={`ed-status-inline ${attendees[0].status === 'WAITLISTED' ? 'ed-status-waitlist' : (attendees[0].status === 'CHECKED_IN' ? 'ed-status-checkedin' : 'ed-status-confirmed')}`}>
                                            {attendees[0].status || 'CONFIRMED'}
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

                                    {attendees[0].status !== 'CHECKED_IN' && (
                                        <button
                                            onClick={() => handleDeleteAttendee(attendees[0].id)}
                                            className="ed-btn-cancel"
                                        >
                                            Cancel My Registration
                                        </button>
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