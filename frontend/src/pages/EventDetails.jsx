import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById } from '../services/eventService';
import { getAttendeesByEvent, registerAttendee, deleteAttendee } from '../services/attendeeService';
import { getUserRole, getUserEmail } from '../services/authService';

const EventDetails = () => {
    const { id } = useParams();

    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '' });

    // NEW: Search state
    const [searchTerm, setSearchTerm] = useState('');

    const userRole = getUserRole();
    const userEmail = getUserEmail(); // Grab the logged-in email!

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
        getAttendeesByEvent(id, 0, 100)
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
                setFormData({ name: '', email: '' });
                loadEventDetails();
                loadAttendees();
            })
            .catch((err) => {
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Registration failed. Please try again.');
                }
            });
    };

    const handleDeleteAttendee = (attendeeId) => {
        const message = userRole === 'ADMIN' ? "Are you sure you want to remove this attendee?" : "Are you sure you want to cancel your registration?";
        if (window.confirm(message)) {
            deleteAttendee(attendeeId)
                .then(() => {
                    loadEventDetails();
                    loadAttendees();
                })
                .catch(err => console.error("Failed to delete attendee", err));
        }
    };

    if (!event) return <div style={{ padding: '20px' }}>Loading event details...</div>;

    const availableSeats = event.capacity - attendees.length;

    // NEW: Filter the attendees list based on the search term
    const filteredAttendees = attendees.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // NEW: Only show the Actions column if the user is an ADMIN, OR if their email is in the currently visible list!
    const showActionsColumn = userRole === 'ADMIN' || filteredAttendees.some(a => a.email === userEmail);

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
                <div style={{ flex: 1, padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxHeight: '350px' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>Registered Attendees</h3>
                        {/* Live Search Bar */}
                        <input
                            type="text"
                            placeholder="Search attendees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '8px', width: '200px', borderRadius: '4px', border: '1px solid #ccc' }}
                        />
                    </div>

                    {filteredAttendees.length === 0 ? (
                        <p>No attendees match your search.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }} border="1">
                            <thead>
                            <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                                <th style={{ padding: '8px' }}>Name</th>
                                <th style={{ padding: '8px' }}>Email</th>

                                {/* Conditionally render the header */}
                                {showActionsColumn && <th style={{ padding: '8px' }}>Actions</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAttendees.map(a => (
                                <tr key={a.id}>
                                    <td style={{ padding: '8px' }}>{a.name}</td>
                                    <td style={{ padding: '8px' }}>{a.email}</td>

                                    {/* Conditionally render the data cell */}
                                    {showActionsColumn && (
                                        <td style={{ padding: '8px', display: 'flex', gap: '5px' }}>

                                            {/* ADMIN sees Edit and Delete */}
                                            {userRole === 'ADMIN' && (
                                                <>
                                                    <Link to={`/edit-attendee/${a.id}`} style={{ padding: '4px 8px', backgroundColor: '#ffc107', color: 'black', textDecoration: 'none', borderRadius: '3px', fontSize: '12px' }}>Edit</Link>
                                                    <button onClick={() => handleDeleteAttendee(a.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                                </>
                                            )}

                                            {/* NORMAL USER only sees "Cancel" if it is THEIR email */}
                                            {userRole !== 'ADMIN' && a.email === userEmail && (
                                                <button onClick={() => handleDeleteAttendee(a.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '12px' }}>Cancel Registration</button>
                                            )}

                                        </td>
                                    )}
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