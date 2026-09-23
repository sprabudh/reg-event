import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, deleteEvent } from '../services/eventService';
import { getCategories } from '../services/categoryService';
import { getUserRole } from '../services/authService';

const EventsList = () => {
    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const userRole = getUserRole();

    // Fetch dynamic categories on mount
    useEffect(() => {
        getCategories()
            .then(res => setCategories(res.data))
            .catch(() => console.error("Failed to fetch categories"));
    }, []);

    // Reload events when page, search term, or selected category changes
    useEffect(() => {
        loadEvents();
    }, [currentPage, searchTerm, selectedCategoryId]);

    const loadEvents = () => {
        getEvents(currentPage, 6, searchTerm, selectedCategoryId) // Changed to 6 per page for a better grid layout
            .then((response) => {
                setEvents(response.data.content);
                setTotalPages(response.data.totalPages);
                setErrorMessage('');
            })
            .catch((error) => console.error("Error fetching events:", error));
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            deleteEvent(id)
                .then(() => loadEvents())
                .catch((error) => {
                    if (error.response && error.response.data) {
                        setErrorMessage(error.response.data.message);
                    } else {
                        setErrorMessage("Failed to delete event.");
                    }
                });
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Event coming up...</h2>
                {userRole === 'ADMIN' && (
                    <Link to="/create-event" className="btn">+ Create Event</Link>
                )}
            </div>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <input
                    type="text"
                    placeholder="Search events by name..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(0);
                    }}
                    style={{ maxWidth: '300px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
                />

                <select
                    value={selectedCategoryId}
                    onChange={(e) => {
                        setSelectedCategoryId(e.target.value);
                        setCurrentPage(0);
                    }}
                    style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}
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
                        className="btn btn-secondary"
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedCategoryId('');
                            setCurrentPage(0);
                        }}
                        style={{ padding: '8px 16px', borderRadius: '4px' }}
                    >
                        Clear Filters
                    </button>
                )}
            </div>

            {errorMessage && <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>⚠️ {errorMessage}</div>}

            {/* Replaced Table with Responsive Card Grid Layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {events.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
                        No events found matching your criteria.
                    </div>
                ) : (
                    events.map((event) => (
                        <div key={event.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '20px', backgroundColor: '#ffffff', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#111827', fontSize: '1.25rem' }}>{event.name}</h3>

                            <div style={{ marginBottom: '20px', color: '#4b5563', fontSize: '14px', flexGrow: 1 }}>
                                <p style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>Date:</strong> <span>{event.date}</span>
                                </p>
                                <p style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>Category:</strong> <span>{event.category ? event.category.name : 'N/A'}</span>
                                </p>
                                <p style={{ margin: '8px 0', display: 'flex', justifyContent: 'space-between' }}>
                                    <strong>Capacity:</strong> <span>{event.capacity} seats</span>
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                <Link to={`/events/${event.id}`} style={{ padding: '10px 16px', backgroundColor: '#4f46e5', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '14px', flex: 1, textAlign: 'center', transition: 'background-color 0.2s' }}>
                                    Book Tickets
                                </Link>

                                {userRole === 'ADMIN' && (
                                    <>
                                        <Link to={`/edit-event/${event.id}`} style={{ padding: '10px 16px', backgroundColor: '#6b7280', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '14px', textAlign: 'center' }}>Edit</Link>
                                        <button onClick={() => handleDelete(event.id)} style={{ padding: '10px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '500', fontSize: '14px', cursor: 'pointer' }}>Delete</button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination remains the same */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '30px' }}>
                    <button className="btn btn-secondary" disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Page {currentPage + 1} of {totalPages}</span>
                    <button className="btn btn-secondary" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                </div>
            )}
        </div>
    );
};

export default EventsList;