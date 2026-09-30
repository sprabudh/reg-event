import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, deleteEvent } from '../services/eventService';
import { getCategories } from '../services/categoryService';
import { getUserRole } from '../services/authService';
import { getMyRegistrations } from '../services/attendeeService';
import {
    APP_ROUTES,
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
    const [currentPage, setCurrentPage] = useState(PAGINATION.DEFAULT_PAGE);
    const [totalPages, setTotalPages] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const userRole = getUserRole();
    const isAdmin = userRole === ROLES.ADMIN;

    const loadEvents = () => {
        // 3 full rows of 5 cards per page
        getEvents(currentPage, PAGINATION.EVENTS_PAGE_SIZE, searchTerm, selectedCategoryId)
            .then((response) => {
                setEvents(response.data.content);
                setTotalPages(response.data.totalPages);
                setErrorMessage('');
            })
            .catch((error) => console.error("Error fetching events:", error));
    };

    // Fetch dynamic categories on mount
    useEffect(() => {
        getCategories()
            .then(res => setCategories(res.data))
            .catch(() => console.error("Failed to fetch categories"));
    }, []);

    // Fetch the current user's registrations (eventId -> status) so cards can show the right action
    useEffect(() => {
        if (userRole === ROLES.USER) {
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
    }, [userRole]);

    // Reload events when page, search term, or selected category changes
    useEffect(() => {
        loadEvents();
    }, [currentPage, searchTerm, selectedCategoryId]);

    const handleDelete = (id) => {
        if (window.confirm(PROMPTS.DELETE_EVENT)) {
            deleteEvent(id)
                .then(() => loadEvents())
                .catch((error) => {
                    setErrorMessage(getErrorMessage(error, ERROR_MESSAGES.LOAD_EVENTS_FAILED));
                });
        }
    };

    return (
        <div>
            <div className="el-toolbar">
                <h2>Event coming up...</h2>
                {isAdmin && (
                    <Link to={APP_ROUTES.CREATE_EVENT} className="btn">+ Create Event</Link>
                )}
            </div>

            <div className="el-filters">
                <input
                    type="text"
                    placeholder="Search events by name..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(PAGINATION.DEFAULT_PAGE);
                    }}
                    className="el-search"
                />

                <select
                    value={selectedCategoryId}
                    onChange={(e) => {
                        setSelectedCategoryId(e.target.value);
                        setCurrentPage(PAGINATION.DEFAULT_PAGE);
                    }}
                    className="el-select"
                >
                    <option value="">All Categories</option>
                    {/* Dynamically map categories for the filter dropdown */}
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>

                    {(searchTerm || selectedCategoryId) && (
                        <button
                            type="button"
                            className="btn btn-secondary el-clear"
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategoryId('');
                                setCurrentPage(PAGINATION.DEFAULT_PAGE);
                            }}
                        >
                            Clear Filters
                        </button>
                    )}
            </div>

            {errorMessage && <div className="el-error">⚠️ {errorMessage}</div>}

            {/* Replaced Table with Responsive Card Grid Layout */}
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

            {/* Pagination remains the same */}
            {totalPages > 1 && (
                <div className="el-pager">
                    <button className="btn btn-secondary" disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                    <span className="el-page-txt">Page {currentPage + 1} of {totalPages}</span>
                    <button className="btn btn-secondary" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                </div>
            )}
        </div>
    );
};

export default EventsList;