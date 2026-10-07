import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTickets, deleteAttendee } from '../services/attendeeService';
import { useConfirm } from '../hooks/useConfirm';
import {
    APP_ROUTES,
    CONFIRM_LABELS,
    DEFAULT_STATUS_BADGE_CLASS,
    ERROR_MESSAGES,
    PROMPTS,
    REFUND_STATUS,
    REGISTRATION_STATUS,
    STATUS_BADGE_CLASSES,
    SUCCESS_MESSAGES,
    buildEventDetailPath
} from '../constants';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const confirm = useConfirm();

    useEffect(() => {
        getMyTickets()
            .then((res) => {
                setTickets(res.data.content || []);
            })
            .catch(() => setError(ERROR_MESSAGES.LOAD_TICKETS_FAILED))
            .finally(() => setLoading(false));
    }, []);

    const sortedTickets = [...tickets].sort(
        (a, b) => new Date((a.eventDate) || 0) - new Date((b.eventDate) || 0)
    );

    const handleCancel = async (ticket) => {
        const confirmed = await confirm({
            message: PROMPTS.cancelRegistrationFor(ticket.eventName),
            confirmLabel: CONFIRM_LABELS.CANCEL_REGISTRATION,
            tone: 'danger'
        });
        if (!confirmed) return;

        deleteAttendee(ticket.id)
            .then(() => {
                setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
                setSuccess(SUCCESS_MESSAGES.CANCEL_REGISTRATION_OK);
                setTimeout(() => setSuccess(''), 3000);
            })
            .catch(() => setError(ERROR_MESSAGES.CANCEL_REGISTRATION_FAILED));
    };

    const handlePrint = (ticket) => {
        const statusClass = STATUS_BADGE_CLASSES[ticket.status] || DEFAULT_STATUS_BADGE_CLASS;

        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket - ${ticket.eventName || 'Event'}</title>
                <style>
                    body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 40px; }
                    .ticket { max-width: 520px; margin: 0 auto; border: 1px solid #cbd5e1; border-radius: 12px; overflow: hidden; }
                    .ticket-header { background-color: #4f46e5; color: white; padding: 20px 24px; }
                    .ticket-header h2 { margin: 0; font-size: 22px; }
                    .ticket-header p { margin: 4px 0 0 0; opacity: 0.85; font-size: 13px; }
                    .ticket-body { padding: 24px; display: flex; gap: 24px; align-items: flex-start; }
                    .ticket-qr img { width: 150px; height: 150px; }
                    .ticket-info { flex: 1; }
                    .ticket-info p { margin: 8px 0; font-size: 14px; color: #334155; }
                    .ticket-info strong { color: #0f172a; }
                    .ticket-id { font-family: monospace; background: #f1f5f9; padding: 6px 10px; border-radius: 6px; font-size: 13px; word-break: break-all; }
                    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; color: ${statusClass === 'bd-green' ? '#16a34a' : statusClass === 'bd-indigo' ? '#4f46e5' : '#111827'}; background: ${statusClass === 'bd-green' ? '#dcfce3' : statusClass === 'bd-indigo' ? '#e0e7ff' : '#e5e7eb'}; }
                    .ticket-footer { border-top: 1px dashed #cbd5e1; padding: 14px 24px; font-size: 12px; color: #64748b; }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="ticket-header">
                        <p>EVENTORA · ENTRY TICKET</p>
                        <h2>${ticket.eventName || 'Event'}</h2>
                        <p>${ticket.eventDate || ''} ${ticket.eventTime ? '· ' + ticket.eventTime : ''}</p>
                    </div>
                    <div class="ticket-body">
                        <div class="ticket-qr">
                            ${ticket.qrCodeBase64
                            ? `<img src="${ticket.qrCodeBase64}" alt="QR Code" />`
                            : '<p style="color:#94a3b8;font-size:12px;">Ticket details unavailable.</p>'}
                        </div>
                        <div class="ticket-info">
                            <p><strong>Attendee:</strong> ${ticket.name}</p>
                            <p><strong>Email:</strong> ${ticket.email}</p>
                            <p><strong>Event:</strong> ${ticket.eventLocation ? ticket.eventLocation : (ticket.eventIsOnline ? 'Online Event' : 'TBA')}</p>
                            <p><strong>Status:</strong> <span class="status-badge">${ticket.status || REGISTRATION_STATUS.CONFIRMED}</span></p>
                            <p><strong>Ticket ID:</strong></p>
                            <p class="ticket-id">${ticket.ticketUuid || 'N/A'}</p>
                            ${ticket.amount && ticket.amount > 0
                            ? `<p><strong>Paid:</strong> ₹${ticket.amount}${ticket.invoiceNo ? ' · Invoice: ' + ticket.invoiceNo : ''}</p>`
                            : '<p><strong>Paid:</strong> Free</p>'}
                        </div>
                    </div>
                    <div class="ticket-footer">Please present this ticket at the venue entrance for check-in. This ticket is non-transferable.</div>
                </div>
                <script>window.onload = function() { window.print(); };</script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    if (loading) return <div className="page-loading">Loading your tickets...</div>;

    return (
        <div className="mt-wrap">
            <h1 className="mt-title">My Tickets</h1>
            <p className="mt-subtitle">All your confirmed registrations, ready for check-in.</p>

            {error && <div className="alert-error">{error}</div>}
            {success && <div className="alert-success">{success}</div>}

            {sortedTickets.length === 0 ? (
                <div className="mt-empty">
                    <p className="mt-empty-text">
                        You haven't registered for any events yet.
                    </p>
                    <Link to={APP_ROUTES.EVENTS} className="mt-empty-link">
                        Browse Events to secure your spot
                    </Link>
                </div>
            ) : (
                <div className="mt-grid">
                    {sortedTickets.map((ticket) => {
                        const badgeClass = STATUS_BADGE_CLASSES[ticket.status] || DEFAULT_STATUS_BADGE_CLASS;

                        return (
                            <div key={ticket.id} className="card mt-card">
                                <div className="mt-ticket-header">
                                    <p className="mt-header-brand">EVENTORA · ENTRY TICKET</p>
                                    <h3 className="mt-header-title">{ticket.eventName || 'Event'}</h3>
                                    <p className="mt-header-sub">
                                        {ticket.eventDate || ''} {ticket.eventTime ? `· ${ticket.eventTime}` : ''}
                                    </p>
                                </div>

                                <div className="mt-body">
                                    <div className="mt-qr-wrap">
                                        {ticket.qrCodeBase64 ? (
                                            <img src={ticket.qrCodeBase64} alt="QR Code Ticket" className="mt-qr-img" />
                                        ) : (
                                            <div className="mt-qr-none">
                                                Ticket<br />Unavailable
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-info">
                                        <p className="mt-row"><strong>Attendee:</strong> {ticket.name}</p>
                                        <p className="mt-row"><strong>Email:</strong> {ticket.email}</p>
                                        <p className="mt-row">
                                            <strong>Location:</strong> {ticket.eventIsOnline ? 'Online Event' : (ticket.eventLocation || 'TBA')}
                                        </p>
                                        <p className="mt-row">
                                            <strong>Status:</strong>{' '}
                                            <span className={`badge-pill mt-status ${badgeClass}`}>
                                                {ticket.status || REGISTRATION_STATUS.CONFIRMED}
                                            </span>
                                        </p>
                                        {ticket.amount && ticket.amount > 0 ? (
                                            <>
                                                <p className="mt-row">
                                                    <strong>Paid:</strong> ₹{ticket.amount}{' '}
                                                    <span className="mt-paid">
                                                        PAID
                                                    </span>
                                                </p>
                                                {ticket.invoiceNo && (
                                                    <p className="mt-row"><strong>Invoice:</strong> <span className="font-mono">{ticket.invoiceNo}</span></p>
                                                )}
                                                {ticket.refundStatus && ticket.refundStatus !== REFUND_STATUS.NONE && (
                                                    <p className="mt-row">
                                                        <strong>Refund:</strong>{' '}
                                                        <span className={`badge-pill ${ticket.refundStatus === REFUND_STATUS.REFUNDED ? 'bd-green' : 'bd-orange'}`}>
                                                            {ticket.refundStatus === REFUND_STATUS.REFUNDED ? 'Refunded' : 'Forfeited'}
                                                        </span>
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p className="mt-row">
                                                <strong>Paid:</strong>{' '}
                                                <span className="txt-green">Free</span>
                                            </p>
                                        )}
                                        <p className="mt-row"><strong>Ticket ID:</strong></p>
                                        <p className="mt-ticket-id">
                                            {ticket.ticketUuid || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-footer">
                                    <button onClick={() => handlePrint(ticket)} className="mt-btn-print">
                                        Print / Save PDF
                                    </button>
                                    <Link to={buildEventDetailPath(ticket.eventId)} className="btn btn-small btn-secondary mt-btn-view">
                                        View Event
                                    </Link>
                                    {ticket.status !== REGISTRATION_STATUS.CHECKED_IN && (
                                        <button onClick={() => handleCancel(ticket)} className="mt-btn-cancel">
                                            Cancel Registration
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyTickets;