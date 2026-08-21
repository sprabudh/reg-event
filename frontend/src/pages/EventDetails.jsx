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
    const [searchTerm, setSearchTerm] = useState('');

    const userRole = getUserRole();
    const userEmail = getUserEmail();

    useEffect(() => {
        loadEventDetails();
        loadAttendees();
    }, [id]);

    const loadEventDetails = () => {
        getEventById(id).then(res => setEvent(res.data)).catch(err => console.error(err));
    };

    const loadAttendees = () => {
        getAttendeesByEvent(id, 0, 100).then(res => setAttendees(res.data.content)).catch(err => console.error(err));
    };

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRegister = (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        registerAttendee(id, formData)
            .then((res) => {
                // Dynamically check the status returned from Spring Boot
                if (res.data && res.data.status === 'WAITLISTED') {
                    setSuccess('Event is full. You have been added to the waitlist!');
                } else {
                    setSuccess('Successfully registered!');
                }
                setFormData({ name: '', email: '' });
                loadEventDetails();
                loadAttendees();
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
            });
    };

    const handleDeleteAttendee = (attendeeId) => {
        const message = userRole === 'ADMIN' ? "Remove this attendee?" : "Cancel your registration?";
        if (window.confirm(message)) {
            deleteAttendee(attendeeId).then(() => { loadEventDetails(); loadAttendees(); }).catch(console.error);
        }
    };

    if (!event) return <div style={{ padding: '20px' }}>Loading...</div>;

    // Calculate available seats strictly based on CONFIRMED attendees
    const confirmedAttendees = attendees.filter(a => a.status === 'CONFIRMED' || !a.status);
    const availableSeats = Math.max(0, event.capacity - confirmedAttendees.length);

    const filteredAttendees = attendees.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // NEW: Sort the attendees so CONFIRMED are at the top, WAITLISTED at the bottom
    const sortedAttendees = [...filteredAttendees].sort((a, b) => {
        // Treat null/undefined status as CONFIRMED for backwards compatibility
        const statusA = a.status || 'CONFIRMED';
        const statusB = b.status || 'CONFIRMED';

        if (statusA === 'CONFIRMED' && statusB === 'WAITLISTED') return -1;
        if (statusA === 'WAITLISTED' && statusB === 'CONFIRMED') return 1;
        return 0;
    });

    const showActionsColumn = userRole === 'ADMIN' || filteredAttendees.some(a => a.email === userEmail);

    return (
        <div>
            <Link to="/events" style={{ textDecoration: 'none', color: '#64748B', fontWeight: '500', marginBottom: '20px', display: 'inline-block' }}>← Back to Events</Link>

            <div className="card" style={{ marginBottom: '30px' }}>
                <h2 style={{ margin: '0 0 15px 0' }}>{event.name}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                    <p style={{ margin: '5px 0' }}><strong>Date:</strong> {event.date}</p>
                    <p style={{ margin: '5px 0' }}><strong>Total Capacity:</strong> {event.capacity}</p>
                    <p style={{ margin: '5px 0' }}><strong>Total Registrations:</strong> {attendees.length}</p>
                    <p style={{ margin: '5px 0' }}><strong>Available Seats:</strong> <span style={{ color: availableSeats === 0 ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>{availableSeats}</span></p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: '1', minWidth: '300px', alignSelf: 'flex-start' }}>
                    <h3 style={{ marginTop: 0 }}>Register</h3>

                    {error && <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
                    {success && <div style={{ backgroundColor: '#D1FAE5', color: '#047857', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{success}</div>}

                    {/* The form remains open regardless of capacity now */}
                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B' }}>Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                        </div>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B' }}>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                        </div>
                        <button
                            type="submit"
                            className="btn"
                            style={{
                                marginTop: '10px',
                                backgroundColor: availableSeats === 0 ? '#d97706' : '#4f46e5' // Changes to orange if waitlist
                            }}
                        >
                            {availableSeats > 0 ? 'Register Now' : 'Join Waitlist'}
                        </button>
                    </form>
                </div>

                <div style={{ flex: '2', minWidth: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>Attendees</h3>
                        <input type="text" placeholder="Search attendees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '200px' }} />
                    </div>

                    {sortedAttendees.length === 0 ? (
                        <p style={{ color: '#64748B' }}>No attendees found.</p>
                    ) : (
                        <table>
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Status</th>
                                {showActionsColumn && <th>Actions</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {/* NEW: Rendering the sorted array instead of the filtered one */}
                            {sortedAttendees.map(a => (
                                <tr key={a.id}>
                                    <td>{a.name}</td>
                                    <td>{a.email}</td>
                                    <td>
                                        <span style={{
                                            color: a.status === 'WAITLISTED' ? '#d97706' : '#16a34a',
                                            fontWeight: '600',
                                            backgroundColor: a.status === 'WAITLISTED' ? '#fef3c7' : '#dcfce3',
                                            padding: '4px 8px',
                                            borderRadius: '12px',
                                            fontSize: '12px'
                                        }}>
                                            {a.status || 'CONFIRMED'}
                                        </span>
                                    </td>
                                    {showActionsColumn && (
                                        <td>
                                            {userRole === 'ADMIN' && (
                                                <>
                                                    <Link to={`/edit-attendee/${a.id}`} className="btn btn-small btn-secondary">Edit</Link>
                                                    <button onClick={() => handleDeleteAttendee(a.id)} className="btn btn-small btn-danger">Delete</button>
                                                </>
                                            )}
                                            {userRole !== 'ADMIN' && a.email === userEmail && (
                                                <button onClick={() => handleDeleteAttendee(a.id)} className="btn btn-small btn-danger">Cancel</button>
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