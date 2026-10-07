import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, deleteEvent } from '../services/eventService';
import { getCategories } from '../services/categoryService';
import { getUserRole } from '../services/authService';
import { getMyRegistrations } from '../services/attendeeService';
import { useConfirm } from '../hooks/useConfirm';
import Pagination from '../components/ui/Pagination';
import { formatHostName } from '../utils/format';
import {
    APP_ROUTES,
    CONFIRM_LABELS,
    ERROR_MESSAGES,
    PAGINATION,
    PROMPTS,
    REGISTRATION_STATUS,
    ROLES,
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

    const userRole = getUserRole();
    const isAdmin = userRole === ROLES.ADMIN;
    const confirm = useConfirm();

    const loadEvents = () => {
        getEvents(currentPage, PAGINATION.EVENTS_PAGE_SIZE, searchTerm, selectedCategoryId)
            .then((response) => {
                const approvedOnly = (response.data.content || []).filter(
                    (e) => !e.approvalStatus || e.approvalStatus === 'APPROVED'
                );
                setEvents(approvedOnly);
                setTotalPages(response.data.totalPages);
                setErrorMessage('');
            })
            .catch((error) => console.error("Error fetching events:", error));
    };

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
    }, [currentPage, searchTerm, selectedCategoryId]);

    const handleDelete = async (id) => {
        const confirmed = await confirm({
            message: PROMPTS.DELETE_EVENT,
            confirmLabel: CONFIRM_LABELS.DELETE_EVENT,
            tone: 'danger'
        });
        if (!confirmed) return;

        deleteEvent(id)
            .then(() => loadEvents())
            .catch((error) => {
                setErrorMessage(getErrorMessage(error, ERROR_MESSAGES.LOAD_EVENTS_FAILED));
            });
    };

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
                marginBottom: '10px' /* REDUCED FROM 25px TO 10px */
            }}>
                <div style={{ flex: 1 }}>
                    <h2 style={{ margin: 0, color: '#111827', whiteSpace: 'nowrap' }}>Event coming up...</h2>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flex: 2 }}>
                    <input
                        type="text"
                        placeholder="Search events..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
                        className="el-search"
                        style={{ margin: 0, width: '280px', padding: '8px 12px' }}
                    />

                    <select
                        value={selectedCategoryId}
                        onChange={(e) => { setSelectedCategoryId(e.target.value); setCurrentPage(0); }}
                        className="el-select"
                        style={{ margin: 0, minWidth: '160px', padding: '8px 30px 8px 12px' }}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>

                    {(searchTerm || selectedCategoryId) && (
                        <button type="button" className="btn btn-secondary" onClick={() => { setSearchTerm(''); setSelectedCategoryId(''); setCurrentPage(0); }} style={{ padding: '8px 16px' }}>
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

            {errorMessage && <div className="el-error">⚠️ {errorMessage}</div>}

            <div className="el-grid">
                {events.length === 0 ? (
                    <div className="el-empty">
                        No events found matching your criteria.
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
                                            <button onClick={() => handleDelete(event.id)} className="el-btn-del">Delete</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <Pagination page={currentPage} totalPages={totalPages} onChange={setCurrentPage} />
        </div>
    );
};

export default EventsList;