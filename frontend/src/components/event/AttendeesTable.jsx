import { Link } from 'react-router-dom';
import {
    REGISTRATION_STATUS,
    TABLE_HEADERS,
    buildEditAttendeePath,
    getAttendeeBadgeClass
} from '../../constants';

/**
 * Search toolbar + attendees table shared by the admin and host event detail
 * pages. `onCheckIn`/`onDelete` receive the attendee object; the caller adapts
 * as needed. `title` is passed because the admin page labels the section
 * "All Attendees (Admin View)".
 */
const AttendeesTable = ({ title, attendees, event, searchTerm, onSearch, paymentByAttendee, onCheckIn, onDelete }) => (
    <>
        <div className="ed-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 className="ed-h3-flush" style={{ margin: 0, whiteSpace: 'nowrap' }}>{title}</h3>
            <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="ed-search-input"
                style={{ flex: 1, maxWidth: '350px' }}
            />
        </div>

        {attendees.length === 0 ? (
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
                {attendees.map((a) => {
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
                                        onClick={() => onCheckIn(a)}
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
                                <button onClick={() => onDelete(a)} className="btn btn-small btn-danger ed-btn-xs">
                                    Delete
                                </button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        )}
    </>
);

export default AttendeesTable;
