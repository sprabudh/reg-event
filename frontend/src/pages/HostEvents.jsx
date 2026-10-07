import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyEvents, deleteMyEvent } from '../services/hostService';
import { getCategories } from '../services/categoryService';
import { useConfirm } from '../hooks/useConfirm';
import { APP_ROUTES, CONFIRM_LABELS, ERROR_MESSAGES, PROMPTS } from '../constants';
import { getErrorMessage } from '../utils/errors';

const STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};

const STATUS_BADGE = {
    [STATUS.PENDING]: 'bd-orange',
    [STATUS.APPROVED]: 'bd-green',
    [STATUS.REJECTED]: 'bd-indigo'
};

const formatHostName = (hostName) => {
    if (!hostName) return 'Host';
    if (hostName.includes('@')) {
        const local = hostName.split('@')[0];
        return local.charAt(0).toUpperCase() + local.slice(1);
    }
    return hostName;
};

const HostEvents = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const confirm = useConfirm();

    const load = useCallback(() => {
        getMyEvents()
            .then((res) => {
                setEvents(res.data.content || []);
                setError('');
            })
            .catch((err) => setError(getErrorMessage(err, ERROR_MESSAGES.LOAD_EVENTS_FAILED)))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    // Fetch categories for the filter dropdown
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

    // Client-side filtering for immediate live search results
    const filteredEvents = events.filter((e) => {
        const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategoryId ? (e.category && e.category.id.toString() === selectedCategoryId) : true;
        return matchesSearch && matchesCategory;
    });

    if (loading) return <div className="page-loading">Loading your events...</div>;

    return (
        <div>
            <div className="el-toolbar">
                <h2>My Hosted Events</h2>
                <Link to={APP_ROUTES.HOST_NEW_EVENT} className="btn">+ Request Event</Link>
            </div>

            {/* Live Search & Category Filter Bar */}
            <div className="el-filters">
                <input
                    type="text"
                    placeholder="Search my events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="el-search"
                />

                <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="el-select"
                >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                    ))}
                </select>

                {(searchTerm || selectedCategoryId) && (
                    <button
                        type="button"
                        className="btn btn-secondary el-clear"
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategoryId('');
                        }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {error && <div className="el-error">{error}</div>}

            {filteredEvents.length === 0 ? (
                <div className="el-empty">
                    {events.length === 0 ? "You haven't submitted any events yet." : "No events match your search."}
                </div>
            ) : (
                <div className="el-grid">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="el-card">
                            <h3 className="el-title">
                                {event.name}
                                <span className={`badge-pill ${STATUS_BADGE[event.approvalStatus] || 'bd-default'}`}>
                                    {event.approvalStatus || 'APPROVED'}
                                </span>
                                {event.expired && <span className="el-ended">Ended</span>}
                            </h3>

                            <div className="el-details">
                                <p className="el-row">
                                    <strong>Hosted By:</strong> <span>{formatHostName(event.hostName)}</span>
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
        </div>
    );
};

export default HostEvents;