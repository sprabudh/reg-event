import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, deleteEvent } from '../services/eventService';
import { getCategories } from '../services/categoryService';
import { getUserRole } from '../services/authService';
import { getMyRegistrations } from '../services/attendeeService';
import { useConfirm } from '../hooks/useConfirm';
import useFlash from '../hooks/useFlash';
import Pagination from '../components/ui/Pagination';
import { formatHostName } from '../utils/format';
import {
    APPROVAL_STATUS,
    APP_ROUTES,
    CONFIRM_LABELS,
    ERROR_MESSAGES,
    PAGINATION,
    PROMPTS,
    REGISTRATION_STATUS,
    ROLES,
    SUCCESS_MESSAGES,
    buildEditEventPath,
    buildEventDetailPath
} from '../constants';
import { getErrorMessage } from '../utils/errors';

const EventsList = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [registrations, setRegistrations] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [success, flash] = useFlash();

    // Guards against out-of-order responses: without it a slow request for
    // "music" can resolve after a fast request for "tech" and overwrite the list.
    const latestRequestId = useRef(0);

    const userRole = getUserRole();
    const isAdmin = userRole === ROLES.ADMIN;
    const confirm = useConfirm();

    // Note: this does not set `loading` on entry. Doing so synchronously inside the
    // effect that calls it is a cascading render; instead `loading` is raised by
    // the handlers that change page/filter, and lowered here once a request
    // settles.
    const loadEvents = useCallback(() => {
        const requestId = ++latestRequestId.current;
        return getEvents(currentPage, PAGINATION.EVENTS_PAGE_SIZE, debouncedSearch, selectedCategoryId)
            .then((response) => {
                if (requestId !== latestRequestId.current) return;
                // The server already hides unapproved events for non-admins, so
                // filtering again here would desync totalPages from the rows.
                const visible = (response.data.content || []).filter(
                    (e) => isAdmin || !e.approvalStatus || e.approvalStatus === APPROVAL_STATUS.APPROVED
                );
                setEvents(visible);
                setTotalPages(response.data.totalPages);
                setErrorMessage('');

                // The page being asked for no longer exists (an event was deleted
                // or reached its end time). Step back to the last page that does,
                // which re-runs this load via the currentPage dependency.
                const lastPage = Math.max(0, (response.data.totalPages || 1) - 1);
                if (currentPage > lastPage) setCurrentPage(lastPage);
            })
            .catch((error) => {
                if (requestId !== latestRequestId.current) return;
                // Without this, a failed load is indistinguishable from
                // "no results", so the page silently shows the empty state.
                setErrorMessage(getErrorMessage(error, ERROR_MESSAGES.LOAD_EVENTS_FAILED));
            })
            .finally(() => {
                if (requestId === latestRequestId.current) setLoading(false);
            });
    }, [currentPage, debouncedSearch, selectedCategoryId, isAdmin]);

    // Debounce so a request is not fired on every keystroke.
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        getCategories()
            .then(res => setCategories(res.data))
            .catch(() => console.error("Failed to fetch categories"));
    }, []);

    useEffect(() => {
        if (!isAdmin) {
            getMyRegistrations()
                .then(res => {
                    const map = {};
                    (res.data || []).forEach(r => {
                        map[r.eventId] = r.status;
                    });
                    setRegistrations(map);
                })
                .catch(() => console.error("Failed to fetch registrations"));
        }
    }, [isAdmin]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            message: PROMPTS.DELETE_EVENT,
            confirmLabel: CONFIRM_LABELS.DELETE_EVENT,
            tone: 'danger'
        });
        if (!confirmed) return;

        deleteEvent(id)
            .then(() => {
                flash(SUCCESS_MESSAGES.DELETE_EVENT_OK);
                return loadEvents();
            })
            .catch((error) => {
                setErrorMessage(getErrorMessage(error, ERROR_MESSAGES.LOAD_EVENTS_FAILED));
            });
    };

    // The server owns the filter (it hides ended events for non-admins), so
    // deleting an event or an event reaching its end time shrinks the result set
    // while the user may be sitting on the last page. Clamp during render so they
    // land on the last page that still has cards, instead of a blank page that
    // reports "No events found" while events plainly exist. Nothing is re-fetched
    // by this; changing page still goes through loadEvents.
    const safePage = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: '64px',
                zIndex: 900,
                backgroundColor: '#F8FAFC',
                padding: '8px 0',
                marginBottom: '10px'
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, color: '#111827', whiteSpace: 'nowrap' }}>Event coming up...</h2>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flex: 2 }}>
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); setLoading(true); }}
                        className="el-search"
                        style={{ margin: 0, width: '280px', padding: '8px 12px' }}
                        aria-label="Search events"
                    />

                    <select
                        value={selectedCategoryId}
                        onChange={(e) => { setSelectedCategoryId(e.target.value); setCurrentPage(0); setLoading(true); }}
                        className="el-select"
                        aria-label="Filter by category"
                        style={{ margin: 0, minWidth: '160px', padding: '8px 30px 8px 12px' }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>

                    {(searchTerm || selectedCategoryId) && (
                        <button type="button" className="btn btn-secondary" onClick={() => { setSearchTerm(''); setSelectedCategoryId(''); setCurrentPage(0); setLoading(true); }} style={{ padding: '8px 16px' }}>
                            Clear
                        </button>
                    )}
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    {isAdmin && (
                        <Link to={APP_ROUTES.CREATE_EVENT} className="btn" style={{ padding: '8px 16px', whiteSpace: 'nowrap' }}>+ Create Event</Link>
                    )}
                </div>
            </div>

            {errorMessage && <div className="el-error" role="alert">{errorMessage}</div>}
            {success && <div className="alert-success" role="status">{success}</div>}

            <div className="el-grid">
                {/* Distinguish "still loading" from "genuinely empty" — otherwise
                    every visit flashes the empty state before data arrives. */}
                {loading ? (
                    <div className="el-empty">Loading events...</div>
                ) : events.length === 0 ? (
                    <div className="el-empty">
                        {errorMessage
                            ? 'Could not load events. Please try again.'
                            : 'No events found matching your criteria.'}
                    </div>
                ) : (
                    events.map((event) => {
                        const registrationStatus = registrations[event.id];
                        let actionText = 'Book Tickets';
                        let isWaitlistAction = false;
                        if (registrationStatus === REGISTRATION_STATUS.WAITLISTED) {
                            actionText = 'Waitlisted';
                            isWaitlistAction = true;
                        } else if (
                            registrationStatus === REGISTRATION_STATUS.CONFIRMED ||
                            registrationStatus === REGISTRATION_STATUS.CHECKED_IN
                        ) {
                            actionText = 'View Ticket';
                        }

                        if (isAdmin) {
                            actionText = 'Manage Event';
                            isWaitlistAction = false;
                        }

                        return (
                            <div key={event.id} className="el-card">
                                <h3 className="el-title">
                                    {event.name}
                                    {event.expired && (
                                        <span className="el-ended">Ended</span>
                                    )}
                                </h3>

                                <div className="el-details">
                                    <p className="el-row">
                                        <strong>Hosted By:</strong> <span>{formatHostName(event.hostName)}</span>
                                    </p>
                                    <p className="el-row">
                                        <strong>Date:</strong> <span>{event.date}</span>
                                    </p>
                                    <p className="el-row">
                                        <strong>Category:</strong> <span>{event.category ? event.category.name : 'N/A'}</span>
                                    </p>
                                    <p className="el-row">
                                        <strong>Capacity:</strong> <span>{event.capacity} seats</span>
                                    </p>
                                </div>

                                <div className="el-actions">
                                    <Link to={buildEventDetailPath(event.id)} className={`el-btn-act ${isWaitlistAction ? 'el-bg-waitlist' : 'el-bg-book'}`}>
                                        {actionText}
                                    </Link>

                                    {isAdmin && (
                                        <>
                                            <Link to={buildEditEventPath(event.id)} className="el-btn-edit">Edit</Link>
                                            <button type="button" onClick={() => handleDelete(event.id)} className="el-btn-del">Delete</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <Pagination
                page={safePage}
                totalPages={totalPages}
                onChange={(p) => { setCurrentPage(p); setLoading(true); }}
            />
        </div>
    );
};

export default EventsList;