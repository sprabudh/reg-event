import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyTickets, deleteAttendee } from '../services/attendeeService';

const STATUS_COLORS = {
    CONFIRMED: { color: '#16a34a', bg: '#dcfce3' },
    CHECKED_IN: { color: '#4f46e5', bg: '#e0e7ff' },
};

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        getMyTickets()
            .then((res) => {
                setTickets(res.data.content || []);
            })
            .catch(() => setError('Failed to load your tickets. Please try again later.'))
            .finally(() => setLoading(false));
    }, []);

    const sortedTickets = [...tickets].sort(
        (a, b) => new Date((a.eventDate) || 0) - new Date((b.eventDate) || 0)
    );

    const handleCancel = (ticket) => {
        if (!window.confirm(`Cancel your registration for "${ticket.eventName || 'this event'}"?`)) return;
        deleteAttendee(ticket.id)
            .then(() => {
                setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
                setSuccess('Registration cancelled successfully.');
                setTimeout(() => setSuccess(''), 3000);
            })
            .catch(() => setError('Failed to cancel registration. Please try again.'));
    };

    const handlePrint = (ticket) => {
        const statusStyle = STATUS_COLORS[ticket.status] || { color: '#111827', bg: '#e5e7eb' };

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
                    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700; color: ${statusStyle.color}; background: ${statusStyle.bg}; }
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
                            <p><strong>Status:</strong> <span class="status-badge">${ticket.status || 'CONFIRMED'}</span></p>
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

    if (loading) return <div style={{ padding: '20px' }}>Loading your tickets...</div>;

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ color: '#111827', margin: '0 0 4px 0' }}>My Tickets</h1>
            <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>All your confirmed registrations, ready for check-in.</p>

            {error && <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
            {success && <div style={{ backgroundColor: '#D1FAE5', color: '#047857', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{success}</div>}

            {sortedTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                    <p style={{ color: '#6b7280', fontSize: '16px', margin: '0 0 16px 0' }}>
                        You haven't registered for any events yet.
                    </p>
                    <Link to="/events" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>
                        Browse Events to secure your spot
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
                    {sortedTickets.map((ticket) => {
                        const badge = STATUS_COLORS[ticket.status] || { color: '#111827', bg: '#e5e7eb' };

                        return (
                            <div key={ticket.id} className="card" style={{ backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <div style={{ backgroundColor: '#4f46e5', color: 'white', padding: '18px 20px' }}>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '11px', letterSpacing: '0.08em', opacity: '0.85' }}>EVENTORA · ENTRY TICKET</p>
                                    <h3 style={{ margin: 0, fontSize: '20px', color: '#ffffff' }}>{ticket.eventName || 'Event'}</h3>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', opacity: '0.9' }}>
                                        {ticket.eventDate || ''} {ticket.eventTime ? `· ${ticket.eventTime}` : ''}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '20px', padding: '20px', alignItems: 'flex-start' }}>
                                    <div style={{ flexShrink: 0, textAlign: 'center' }}>
                                        {ticket.qrCodeBase64 ? (
                                            <img src={ticket.qrCodeBase64} alt="QR Code Ticket" style={{ width: '140px', height: '140px', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                        ) : (
                                            <div style={{ width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}>
                                                Ticket<br />Unavailable
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ flex: 1, fontSize: '14px', color: '#334155' }}>
                                        <p style={{ margin: '6px 0' }}><strong>Attendee:</strong> {ticket.name}</p>
                                        <p style={{ margin: '6px 0' }}><strong>Email:</strong> {ticket.email}</p>
                                        <p style={{ margin: '6px 0' }}>
                                            <strong>Location:</strong> {ticket.eventIsOnline ? 'Online Event' : (ticket.eventLocation || 'TBA')}
                                        </p>
                                        <p style={{ margin: '6px 0' }}>
                                            <strong>Status:</strong>{' '}
                                            <span style={{ color: badge.color, fontWeight: '600', backgroundColor: badge.bg, padding: '3px 10px', borderRadius: '12px', fontSize: '12px', marginLeft: '6px' }}>
                                                {ticket.status || 'CONFIRMED'}
                                            </span>
                                        </p>
                                        {ticket.amount && ticket.amount > 0 ? (
                                            <>
                                                <p style={{ margin: '6px 0' }}>
                                                    <strong>Paid:</strong> ₹{ticket.amount}{' '}
                                                    <span style={{ color: '#16a34a', backgroundColor: '#dcfce3', fontWeight: '600', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', marginLeft: '4px' }}>
                                                        PAID
                                                    </span>
                                                </p>
                                                {ticket.invoiceNo && (
                                                    <p style={{ margin: '6px 0' }}><strong>Invoice:</strong> <span style={{ fontFamily: 'monospace' }}>{ticket.invoiceNo}</span></p>
                                                )}
                                                {ticket.refundStatus && ticket.refundStatus !== 'NONE' && (
                                                    <p style={{ margin: '6px 0' }}>
                                                        <strong>Refund:</strong>{' '}
                                                        <span style={{
                                                            color: ticket.refundStatus === 'REFUNDED' ? '#16a34a' : '#d97706',
                                                            fontWeight: '600',
                                                            backgroundColor: ticket.refundStatus === 'REFUNDED' ? '#dcfce3' : '#fef3c7',
                                                            padding: '3px 10px',
                                                            borderRadius: '12px',
                                                            fontSize: '12px'
                                                        }}>
                                                            {ticket.refundStatus === 'REFUNDED' ? 'Refunded' : 'Forfeited'}
                                                        </span>
                                                    </p>
                                                )}
                                            </>
                                        ) : (
                                            <p style={{ margin: '6px 0' }}>
                                                <strong>Paid:</strong>{' '}
                                                <span style={{ color: '#10b981', fontWeight: '700' }}>Free</span>
                                            </p>
                                        )}
                                        <p style={{ margin: '6px 0' }}><strong>Ticket ID:</strong></p>
                                        <p style={{ margin: '6px 0', fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', wordBreak: 'break-all' }}>
                                            {ticket.ticketUuid || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ borderTop: '1px dashed #cbd5e1', padding: '14px 20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <button onClick={() => handlePrint(ticket)} style={{ padding: '8px 14px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                                        Print / Save PDF
                                    </button>
                                    <Link to={`/events/${ticket.eventId}`} className="btn btn-small btn-secondary" style={{ padding: '8px 14px', textDecoration: 'none', fontSize: '13px' }}>
                                        View Event
                                    </Link>
                                    {ticket.status !== 'CHECKED_IN' && (
                                        <button onClick={() => handleCancel(ticket)} style={{ padding: '8px 14px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
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