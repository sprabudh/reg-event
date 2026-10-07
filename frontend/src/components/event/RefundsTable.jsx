import { TABLE_HEADERS } from '../../constants';
import { getRefundBadge } from '../../utils/payments';
import { formatDateTime } from '../../utils/format';

/**
 * The cancelled-registration/refunds table shared by the admin and host event
 * detail pages.
 */
const RefundsTable = ({ cancelledPayments }) => (
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
                    const r = getRefundBadge(p.refundStatus);
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
);

export default RefundsTable;
