import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyEvents, deleteMyEvent } from '../services/hostService';
import { getCategories } from '../services/categoryService';
import { useConfirm } from '../hooks/useConfirm';
import Pagination from '../components/ui/Pagination';
import { APP_ROUTES, CONFIRM_LABELS, ERROR_MESSAGES, PROMPTS, PAGINATION, getApprovalBadgeClass } from '../constants';
import { getErrorMessage } from '../utils/errors';
import { formatHostName } from '../utils/format';

const HostEvents = () => {
    const [allEvents, setAllEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(0);

    const load = useCallback(() => {
        getMyEvents(0, PAGINATION.LARGE_PAGE_SIZE || 1000)
            .then((res) => {
                setAllEvents(res.data.content || []);
                setError('');
            })
            .catch((err) => setError(getErrorMessage(err, ERROR_MESSAGES.LOAD_EVENTS_FAILED)))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    useEffect(() => {
        getCategories()
            .then(res => setCategories(res.data))
            .catch(() => console.error("Failed to fetch categories"));
    }, []);

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            message: PROMPTS.DELETE_EVENT,
            confirmLabel: CONFIRM_LABELS.DELETE_EVENT,
            tone: 'danger'
        });
        if (!confirmed) return;

        deleteMyEvent(id)
            .then(() => load())
            .catch((err) => setError(getErrorMessage(err, ERROR_MESSAGES.LOAD_EVENTS_FAILED)));
    };

    const filteredEvents = allEvents.filter((e) => {
        const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategoryId ? (e.category && e.category.id.toString() === selectedCategoryId) : true;
        return matchesSearch && matchesCategory;
    });

    const pageSize = PAGINATION.EVENTS_PAGE_SIZE;
    const totalPages = Math.ceil(filteredEvents.length / pageSize);
    const paginatedEvents = filteredEvents.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

    useEffect(() => {
        setCurrentPage(0);
    }, [searchTerm, selectedCategoryId]);

    if (loading) return <div className="page-loading">Loading your events...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 200px)' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: '64px',
                zIndex: 900,
                backgroundColor: '#F8FAFC',
                padding: '15px 0',
                marginBottom: '10px' /* REDUCED FROM 25px TO 10px */
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, color: '#111827', whiteSpace: 'nowrap' }}>My Events</h2>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flex: 2 }}>
                    <input
                        type="text"
                        placeholder="Search my events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="el-search"
                        style={{ margin: 0, width: '280px', padding: '8px 12px' }}
                    />

                    <select
                        value={selectedCategoryId}
                        onChange={(e) => setSelectedCategoryId(e.target.value)}
                        className="el-select"
                        style={{ margin: 0, minWidth: '160px', padding: '8px 30px 8px 12px' }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>)}
                    </select>

                    {(searchTerm || selectedCategoryId) && (
                        <button type="button" className="btn btn-secondary" onClick={() => { setSearchTerm(''); setSelectedCategoryId(''); }} style={{ padding: '8px 16px' }}>
                            Clear
                        </button>
                    )}
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Link to={APP_ROUTES.HOST_NEW_EVENT} className="btn" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>+ Request Event</Link>
                </div>
            </div>

            {error && <div className="el-error">{error}</div>}

            {paginatedEvents.length === 0 ? (
                <div className="el-empty">
                    {allEvents.length === 0 ? "You haven't submitted any events yet." : "No events match your search."}
                </div>
            ) : (
                <div className="el-grid">
                    {paginatedEvents.map((event) => (
                        <div key={event.id} className="el-card">
                            <h3 className="el-title">
                                {event.name}
                                <span className={`badge-pill ${getApprovalBadgeClass(event.approvalStatus)}`}>
                                    {event.approvalStatus || 'APPROVED'}
                                </span>
                                {event.expired && <span className="el-ended">Ended</span>}
                            </h3>

                            <div className="el-details">
                                <p className="el-row">
                                    <strong>Hosted By:</strong> <span>{formatHostName(event.hostName, 'Host')}</span>
                                </p>
                                <p className="el-row">
                                    <strong>Date:</strong> <span>{event.date}</span>
                                </p>
                                <p className="el-row">
                                    <strong>Category:</strong>{' '}
                                    <span>{event.category ? event.category.name : 'N/A'}</span>
                                </p>
                                <p className="el-row">
                                    <strong>Capacity:</strong> <span>{event.capacity} seats</span>
                                </p>
                                {event.rejectionReason && (
                                    <p className="el-row" style={{ color: '#b91c1c' }}>
                                        <strong>Reason:</strong> <span>{event.rejectionReason}</span>
                                    </p>
                                )}
                            </div>

                            <div className="el-actions">
                                <Link to={`/host/events/${event.id}`} className="el-btn-act el-bg-book">
                                    Manage
                                </Link>
                                <Link to={`/host/events/${event.id}/edit`} className="el-btn-edit">Edit</Link>
                                <button onClick={() => handleDelete(event.id)} className="el-btn-del">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </div>
    );
};

export default HostEvents;