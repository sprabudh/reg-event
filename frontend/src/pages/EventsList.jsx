import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents, deleteEvent } from '../services/eventService';

const EventsList = () => {
    const [events, setEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        loadEvents();
    }, [currentPage]); // Reloads when page changes

    const loadEvents = () => {
        getEvents(currentPage, 5, searchTerm)
            .then((response) => {
                setEvents(response.data.content);
                setTotalPages(response.data.totalPages);
                setErrorMessage(''); // Clear errors on successful load
            })
            .catch((error) => console.error("Error fetching events:", error));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(0); // Reset to first page when searching
        loadEvents();
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            deleteEvent(id)
                .then(() => {
                    loadEvents(); // Reload table after deletion
                })
                .catch((error) => {
                    // This catches our 409 Conflict if attendees are registered!
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>All Events</h2>
                <Link to="/create-event" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                    + Create Event
                </Link>
            </div>

            {/* Fulfilling Mandatory Filtering Requirement */}
            <form onSubmit={handleSearch} style={{ margin: '20px 0', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Search events by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '8px', width: '300px' }}
                />
                <button type="submit" style={{ padding: '8px 15px', backgroundColor: '#61dafb', border: 'none', cursor: 'pointer' }}>Search</button>
                <button type="button" onClick={() => { setSearchTerm(''); setCurrentPage(0); setTimeout(loadEvents, 100); }} style={{ padding: '8px 15px', cursor: 'pointer' }}>Clear</button>
            </form>

            {errorMessage && <div style={{ backgroundColor: '#ff4d4d', color: 'white', padding: '10px', marginBottom: '15px', borderRadius: '5px' }}>⚠️ {errorMessage}</div>}

            <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1">
                <thead>
                <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                    <th style={{ padding: '10px' }}>ID</th>
                    <th style={{ padding: '10px' }}>Name</th>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Capacity</th>
                    <th style={{ padding: '10px' }}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {events.length === 0 ? (
                    <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No events found.</td></tr>
                ) : (
                    events.map((event) => (
                        <tr key={event.id}>
                            <td style={{ padding: '10px' }}>{event.id}</td>
                            <td style={{ padding: '10px' }}>{event.name}</td>
                            <td style={{ padding: '10px' }}>{event.date}</td>
                            <td style={{ padding: '10px' }}>{event.capacity}</td>
                            <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                                <Link to={`/events/${event.id}`} style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '3px' }}>View</Link>
                                <Link to={`/edit-event/${event.id}`} style={{ padding: '5px 10px', backgroundColor: '#ffc107', color: 'black', textDecoration: 'none', borderRadius: '3px' }}>Edit</Link>
                                <button onClick={() => handleDelete(event.id)} style={{ padding: '5px 10px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>Delete</button>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                    <button disabled={currentPage === 0} onClick={() => setCurrentPage(currentPage - 1)} style={{ padding: '8px 15px', cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}>Previous</button>
                    <span style={{ fontWeight: 'bold' }}>Page {currentPage + 1} of {totalPages}</span>
                    <button disabled={currentPage >= totalPages - 1} onClick={() => setCurrentPage(currentPage + 1)} style={{ padding: '8px 15px', cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer' }}>Next</button>
                </div>
            )}
        </div>
    );
};

export default EventsList;