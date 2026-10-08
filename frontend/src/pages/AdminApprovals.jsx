import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPendingEvents, approveEvent, rejectEvent } from '../services/hostService';
import { useConfirm } from '../hooks/useConfirm';
import useFlash from '../hooks/useFlash';
import Pagination from '../components/ui/Pagination';
import {
    APP_ROUTES,
    APPROVAL_STATUS,
    PAGINATION,
    REJECTION_REASON_ADMIN,
    buildEventDetailPath,
    getApprovalBadgeClass
} from '../constants';
import { getErrorMessage } from '../utils/errors';
import { formatHostName } from '../utils/format';

const AdminApprovals = () => {
    const [events, setEvents] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [success, flash] = useFlash();
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    // Server-side total, not events.length -- the count shown in the heading
    // used to describe only the current page.
    const [totalElements, setTotalElements] = useState(0);
    // Ids with an approve/reject in flight, so a double click cannot fire twice.
    const [busyIds, setBusyIds] = useState([]);
    const confirm = useConfirm();

    const load = useCallback(() => {
        getPendingEvents(APPROVAL_STATUS.PENDING, currentPage, PAGINATION.EVENTS_PAGE_SIZE)
            .then((res) => {
                setEvents(res.data.content || []);
                setTotalPages(res.data.totalPages || 0);
                setTotalElements(res.data.totalElements ?? (res.data.content || []).length);
                setError('');
            })
            .catch((err) => setError(getErrorMessage(err, 'Failed to load the approval queue.')))
            .finally(() => setLoading(false));
    }, [currentPage]);

    useEffect(() => { load(); }, [load]);

    const markBusy = (id, busy) => {
        setBusyIds((prev) => (busy ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
    };

    const handleApproveEvent = async (id) => {
        const ok = await confirm({
            message: 'Approve this event? It becomes visible to attendees immediately.',
            confirmLabel: 'Approve'
        });
        if (!ok) return;

        markBusy(id, true);
        approveEvent(id)
            .then(() => { flash('Event approved and published.'); load(); })
            .catch((err) => setError(getErrorMessage(err, 'Failed to approve event.')))
            .finally(() => markBusy(id, false));
    };

    const handleRejectEvent = async (id, name) => {
        const ok = await confirm({
            message: `Reject "${name}"? It will not be visible to attendees.`,
            confirmLabel: 'Reject',
            tone: 'danger'
        });
        if (!ok) return;

        markBusy(id, true);
        rejectEvent(id, REJECTION_REASON_ADMIN)
            .then(() => { flash('Event rejected.'); load(); })
            .catch((err) => setError(getErrorMessage(err, 'Failed to reject event.')))
            .finally(() => markBusy(id, false));
    };

    if (loading) return <div className="page-loading">Loading approvals...</div>;

    return (
        <div>
            <div className="el-toolbar">
                <h2>Pending Approvals</h2>
                <Link to={APP_ROUTES.EVENTS} className="btn btn-secondary">All Events</Link>
            </div>

            {error && <div className="el-error" role="alert">{error}</div>}
            {success && <div className="alert-success" role="status">{success}</div>}

            <h3 className="el-title" style={{ marginTop: 24 }}>
                Event requests ({totalElements})
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
                                    <strong>Hosted By:</strong> <span>{formatHostName(event.hostName, 'Unknown')}</span>
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
                                <Link to={buildEventDetailPath(event.id)} className="el-btn-act el-bg-book">
                                    View
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => handleApproveEvent(event.id)}
                                    disabled={busyIds.includes(event.id)}
                                    className="el-btn-act el-bg-book"
                                >
                                    Approve
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleRejectEvent(event.id, event.name)}
                                    disabled={busyIds.includes(event.id)}
                                    className="el-btn-del"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </div>
    );
};

export default AdminApprovals;