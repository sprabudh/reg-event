import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/eventService';

const EventsList = () => {
    const [events, setEvents] = useState([]);

    // This runs automatically when the page loads
    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = () => {
        getEvents(0, 10) // Fetch page 0, size 10
            .then((response) => {
                // Spring Data JPA puts the array of data inside a "content" field
                setEvents(response.data.content);
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
                    <tr><td colSpan="4" style={{ padding: '10px', textAlign: 'center' }}>No events found. Create one!</td></tr>
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
        </div>
    );
};

export default EventsList;