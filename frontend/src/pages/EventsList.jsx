import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/eventService';

const EventsList = () => {
    const [events, setEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // This runs automatically when the page loads OR when currentPage changes
    useEffect(() => {
        loadEvents();
    }, [currentPage]);

    const loadEvents = () => {
        getEvents(currentPage, 5) // Fetching 5 items per page so it's easy to test!
            .then((response) => {
                setEvents(response.data.content);
                setTotalPages(response.data.totalPages);
            })
            .catch((error) => {
                console.error("Error fetching events:", error);
            });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>All Events</h2>
                <Link to="/create-event" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                    + Create Event
                </Link>
            </div>

            <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }} border="1">
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
                    <tr><td colSpan="5" style={{ padding: '10px', textAlign: 'center' }}>No events found. Create one!</td></tr>
                ) : (
                    events.map((event) => (
                        <tr key={event.id}>
                            <td style={{ padding: '10px' }}>{event.id}</td>
                            <td style={{ padding: '10px' }}>{event.name}</td>
                            <td style={{ padding: '10px' }}>{event.date}</td>
                            <td style={{ padding: '10px' }}>{event.capacity}</td>
                            <td style={{ padding: '10px' }}>
                                <Link to={`/events/${event.id}`} style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', textDecoration: 'none', borderRadius: '3px' }}>
                                    View
                                </Link>
                            </td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
                    <button
                        disabled={currentPage === 0}
                        onClick={() => setCurrentPage(currentPage - 1)}
                        style={{ padding: '8px 15px', cursor: currentPage === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        Previous
                    </button>

                    <span style={{ fontWeight: 'bold' }}>
                        Page {currentPage + 1} of {totalPages}
                    </span>

                    <button
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => setCurrentPage(currentPage + 1)}
                        style={{ padding: '8px 15px', cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default EventsList;