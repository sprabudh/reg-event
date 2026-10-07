import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPendingEvents, approveEvent, rejectEvent } from '../services/hostService';
import { useConfirm } from '../hooks/useConfirm';
import useFlash from '../hooks/useFlash';
import { APP_ROUTES, buildEventDetailPath, getApprovalBadgeClass } from '../constants';
import { getErrorMessage } from '../utils/errors';

const AdminApprovals = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [success, flash] = useFlash();
    const confirm = useConfirm();

    const load = useCallback(() => {
        getPendingEvents('PENDING')
            .then((res) => {
                setEvents(res.data.content || []);
                setError('');
            })
            .catch((err) => setError(getErrorMessage(err, 'Failed to load the approval queue.')))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleApproveEvent = async (id) => {
        const ok = await confirm({
            message: 'Approve this event? It becomes visible to attendees immediately.',
            confirmLabel: 'Approve'
        });
        if (!ok) return;

        approveEvent(id)
            .then(() => { flash('Event approved and published.'); load(); })
            .catch((err) => setError(getErrorMessage(err, 'Failed to approve event.')));
    };

    const handleRejectEvent = async (id, name) => {
        const ok = await confirm({
            message: `Reject "${name}"? It will not be visible to attendees.`,
            confirmLabel: 'Reject',
            tone: 'danger'
        });
        if (!ok) return;

        rejectEvent(id, 'Rejected by admin')
            .then(() => { flash('Event rejected.'); load(); })
            .catch((err) => setError(getErrorMessage(err, 'Failed to reject event.')));
    };

    if (loading) return <div className="page-loading">Loading approvals...</div>;

    return (
        <div>
            <div className="el-toolbar">
                <h2>Pending Approvals</h2>
                <Link to={APP_ROUTES.EVENTS} className="btn btn-secondary">All Events</Link>
            </div>

            {error && <div className="el-error">{error}</div>}
            {success && <div className="alert-success">{success}</div>}

            <h3 className="el-title" style={{ marginTop: 24 }}>
                Event requests ({events.length})
            </h3>
            {events.length === 0 ? (
                <div className="el-empty">No events awaiting review.</div>
            ) : (
                <div className="el-grid">
                    {events.map((event) => (
                        <div key={event.id} className="el-card">
                            <h3 className="el-title">
                                {event.name}{' '}
                                <span className={`badge-pill ${getApprovalBadgeClass(event.approvalStatus)}`}>
                                    {event.approvalStatus}
                                </span>
                            </h3>
                            <div className="el-details">
                                <p className="el-row">
                                    <strong>Hosted By:</strong> <span>{event.hostName || 'Unknown'}</span>
                                </p>
                                <p className="el-row">
                                    <strong>Category:</strong> <span>{event.category ? event.category.name : 'N/A'}</span>
                                </p>
                                <p className="el-row">
                                    <strong>Date:</strong> <span>{event.date}</span>
                                </p>
                                <p className="el-row">
                                    <strong>Capacity:</strong> <span>{event.capacity} seats</span>
                                </p>
                            </div>
                            <div className="el-actions">
                                <Link to={buildEventDetailPath(event.id)} className="el-btn-edit">
                                    View
                                </Link>
                                <button onClick={() => handleApproveEvent(event.id)} className="el-btn-act el-bg-book">
                                    Approve
                                </button>
                                <button onClick={() => handleRejectEvent(event.id, event.name)} className="el-btn-del">
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminApprovals;