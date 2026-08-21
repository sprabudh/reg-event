import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, deleteEvent } from '../services/eventService';
import { getUserRole } from '../services/authService';

const EventsList = () => {
    const [events, setEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const userRole = getUserRole();

    // The Magic Fix: React now watches both currentPage AND searchTerm
    useEffect(() => {
        loadEvents();
    }, [currentPage, searchTerm]);

    const loadEvents = () => {
        getEvents(currentPage, 5, searchTerm)
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

            {/* Changed from a form to a div for clean Live Search */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Search events by name..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(0); // Snaps back to page 0 to prevent pagination bugs
                    }}
                    style={{ maxWidth: '300px' }}
                />

                {/* Clean Clear button that only shows up when there is text */}
                {searchTerm && (
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                            setSearchTerm('');
                            setCurrentPage(0);
                        }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {errorMessage && <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '6px', marginBottom: '15px' }}>⚠️ {errorMessage}</div>}

            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Event Name</th>
                    <th>Date</th>
                    <th>Capacity</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {events.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center' }}>No events found.</td></tr>
                ) : (
                    events.map((event) => (
                        <tr key={event.id}>
                            <td>{event.id}</td>
                            <td>{event.name}</td>
                            <td>{event.date}</td>
                            <td>{event.capacity}</td>
                            <td>
                                <Link to={`/events/${event.id}`} className="btn btn-small">View</Link>

                                {userRole === 'ADMIN' && (
                                    <>
                                        <Link to={`/edit-event/${event.id}`} className="btn btn-small btn-secondary">Edit</Link>
                                        <button onClick={() => handleDelete(event.id)} className="btn btn-small btn-danger">Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                    <button className="btn btn-secondary" disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)}>Previous</button>
                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Page {currentPage + 1} of {totalPages}</span>
                    <button className="btn btn-secondary" disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
                </div>
            )}
        </div>
    );
};

export default EventsList;