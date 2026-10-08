import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTickets, deleteAttendee } from '../services/attendeeService';
import { useConfirm } from '../hooks/useConfirm';
import useFlash from '../hooks/useFlash';
import Pagination from '../components/ui/Pagination';
import {
    APP_ROUTES,
    CONFIRM_LABELS,
    DEFAULT_STATUS_BADGE_CLASS,
    ERROR_MESSAGES,
    PAGINATION,
    PROMPTS,
    REFUND_STATUS,
    REGISTRATION_STATUS,
    STATUS_BADGE_CLASSES,
    SUCCESS_MESSAGES,
    buildEventDetailPath
} from '../constants';
import { getErrorMessage } from '../utils/errors';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, flash] = useFlash();
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const confirm = useConfirm();

    useEffect(() => {
        getMyTickets(currentPage, PAGINATION.EVENTS_PAGE_SIZE)
            .then((res) => {
                setTickets(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);
            })
            .catch(() => setError(ERROR_MESSAGES.LOAD_TICKETS_FAILED))
            .finally(() => setLoading(false));
    }, [currentPage]);

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
                flash(SUCCESS_MESSAGES.CANCEL_REGISTRATION_OK);
                setError('');
            })
            .catch((err) => setError(getErrorMessage(err, ERROR_MESSAGES.CANCEL_REGISTRATION_FAILED)));
    };

    /**
     * The print view is a raw HTML string written into a new document, so every
     * interpolated value has to be escaped -- an event name or attendee name
     * containing markup would otherwise execute in that window.
     */
    const escapeHtml = (value) =>
        String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');

    /**
     * Single source for the venue line. The card and the printed ticket used to
     * disagree: an online event that also had a location printed the venue but
     * showed "Online Event" on screen.
     */
    const getLocationLabel = (ticket) =>
        ticket.eventIsOnline ? 'Online Event' : (ticket.eventLocation || 'TBA');

    const handlePrint = (ticket) => {
        const statusClass = STATUS_BADGE_CLASSES[ticket.status] || DEFAULT_STATUS_BADGE_CLASS;

        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            // Popup blocked: the click used to do nothing at all.
            setError('Your browser blocked the print window. Allow pop-ups for this site, or use your browser\'s Print command.');
            return;
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Ticket - ${escapeHtml(ticket.eventName || 'Event')}</title>
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
                        <h2>${escapeHtml(ticket.eventName || 'Event')}</h2>
                        <p>${escapeHtml(ticket.eventDate || '')} ${ticket.eventTime ? '· ' + escapeHtml(ticket.eventTime) : ''}</p>
                    </div>
                    <div class="ticket-body">
                        <div class="ticket-qr">
                            ${ticket.qrCodeBase64
                            ? `<img src="${escapeHtml(ticket.qrCodeBase64)}" alt="QR Code" />`
                            : '<p style="color:#94a3b8;font-size:12px;">Ticket details unavailable.</p>'}
                        </div>
                        <div class="ticket-info">
                            <p><strong>Attendee:</strong> ${escapeHtml(ticket.name)}</p>
                            <p><strong>Email:</strong> ${escapeHtml(ticket.email)}</p>
                            <p><strong>Event:</strong> ${escapeHtml(getLocationLabel(ticket))}</p>
                            <p><strong>Status:</strong> <span class="status-badge">${escapeHtml(ticket.status || REGISTRATION_STATUS.CONFIRMED)}</span></p>
                            <p><strong>Ticket ID:</strong></p>
                            <p class="ticket-id">${escapeHtml(ticket.ticketUuid || 'N/A')}</p>
                            ${ticket.amount && ticket.amount > 0
                            ? `<p><strong>Paid:</strong> ₹${escapeHtml(ticket.amount)}${ticket.invoiceNo ? ' · Invoice: ' + escapeHtml(ticket.invoiceNo) : ''}</p>`
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

            {error && <div className="alert-error" role="alert">{error}</div>}
            {success && <div className="alert-success" role="status">{success}</div>}

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
                                            <strong>Location:</strong> {getLocationLabel(ticket)}
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
                                    <button type="button" onClick={() => handlePrint(ticket)} className="mt-btn-print">
                                        Print / Save PDF
                                    </button>
                                    <Link to={buildEventDetailPath(ticket.eventId)} className="btn btn-small btn-secondary mt-btn-view">
                                        View Event
                                    </Link>
                                    {ticket.status !== REGISTRATION_STATUS.CHECKED_IN && (
                                        <button type="button" onClick={() => handleCancel(ticket)} className="mt-btn-cancel">
                                            Cancel Registration
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </div>
    );
};

export default MyTickets;