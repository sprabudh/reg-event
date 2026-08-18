import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById } from '../services/eventService';
import { getAttendeesByEvent, registerAttendee } from '../services/attendeeService';
import { getAttendeesByEvent, registerAttendee, deleteAttendee } from '../services/attendeeService';

const EventDetails = () => {
    // This grabs the ID from the URL (e.g., /events/1)
    const { id } = useParams();

    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state for new attendee
    const [formData, setFormData] = useState({ name: '', email: '' });

    useEffect(() => {
        loadEventDetails();
        loadAttendees();
    }, [id]);

    const loadEventDetails = () => {
        getEventById(id)
            .then(res => setEvent(res.data))
            .catch(err => console.error("Error fetching event:", err));
    };

    const loadAttendees = () => {
        getAttendeesByEvent(id, 0, 100) // Getting up to 100 attendees for the demo
            .then(res => setAttendees(res.data.content))
            .catch(err => console.error("Error fetching attendees:", err));
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        registerAttendee(id, formData)
            .then(() => {
                setSuccess('Successfully registered!');
                setFormData({ name: '', email: '' }); // Clear form
                loadEventDetails(); // Reload to update available seats
                loadAttendees(); // Reload the list to show the new person
            })
            .catch((err) => {
                // This catches our custom Spring Boot backend errors! (409 Conflict)
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Registration failed. Please try again.');
                }
            });
    };

    const handleDeleteAttendee = (attendeeId) => {
        if (window.confirm("Are you sure you want to remove this attendee?")) {
            deleteAttendee(attendeeId)
                .then(() => {
                    loadEventDetails(); // Reload to update available seats
                    loadAttendees(); // Refresh the list
                })
                .catch(err => console.error("Failed to delete attendee", err));
        }
    };

    if (!event) return <div style={{ padding: '20px' }}>Loading event details...</div>;

    const availableSeats = event.capacity - attendees.length;

    return (
        <div>
            <Link to="/events" style={{ textDecoration: 'none', color: '#61dafb' }}>← Back to Events</Link>

            <div style={{ backgroundColor: '#f9f9f9', padding: '20px', marginTop: '20px', borderRadius: '8px' }}>
                <h2 style={{ margin: '0 0 10px 0' }}>{event.name}</h2>
                <p><strong>Date:</strong> {event.date}</p>
                <p><strong>Total Capacity:</strong> {event.capacity}</p>
                <p><strong>Registered:</strong> {attendees.length}</p>
                <p><strong>Available Seats:</strong> <span style={{ color: availableSeats === 0 ? 'red' : 'green', fontWeight: 'bold' }}>{availableSeats}</span></p>
            </div>

            <div style={{ display: 'flex', gap: '40px', marginTop: '30px' }}>
                {/* Registration Form */}
                <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h3>Register for this Event</h3>

                    {error && <div style={{ color: 'white', backgroundColor: '#ff4d4d', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>❌ {error}</div>}
                    {success && <div style={{ color: 'white', backgroundColor: '#28a745', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>✅ {success}</div>}

                    {availableSeats === 0 ? (
                        <p style={{ color: 'red', fontWeight: 'bold' }}>Registration is closed. This event is at full capacity.</p>
                    ) : (
                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label>Full Name:</label><br/>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} />
                            </div>
                            <div>
                                <label>Email Address:</label><br/>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ width: '100%', padding: '8px' }} />
                            </div>
                            <button type="submit" style={{ padding: '10px', backgroundColor: '#61dafb', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                                Register Now
                            </button>
                        </form>
                    )}
                </div>

                {/* Attendees List */}
                <div style={{ flex: 1 }}>
                    <h3>Registered Attendees</h3>
                    {attendees.length === 0 ? (
                        <p>No one has registered yet. Be the first!</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1">
                            <thead>
                            <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Name</th>
                                <th style={{ padding: '8px' }}>Email</th>
                                <th style={{ padding: '8px' }}>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {attendees.map(a => (
                                <tr key={a.id}>
                                    <td style={{ padding: '8px' }}>{a.name}</td>
                                    <td style={{ padding: '8px' }}>{a.email}</td>
                                    <td style={{ padding: '8px', display: 'flex', gap: '5px' }}>
                                        <Link to={`/edit-attendee/${a.id}`} style={{ padding: '4px 8px', backgroundColor: '#ffc107', color: 'black', textDecoration: 'none', borderRadius: '3px', fontSize: '12px' }}>Edit</Link>
                                        <button onClick={() => handleDeleteAttendee(a.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetails;