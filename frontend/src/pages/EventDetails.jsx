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
        setError(''); setSuccess('');
        registerAttendee(id, formData)
            .then(() => {
                setSuccess('Successfully registered!');
                setFormData({ name: '', email: '' });
                loadEventDetails(); loadAttendees();
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

    const availableSeats = event.capacity - attendees.length;
    const filteredAttendees = attendees.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const showActionsColumn = userRole === 'ADMIN' || filteredAttendees.some(a => a.email === userEmail);

    return (
        <div>
            <Link to="/events" style={{ textDecoration: 'none', color: '#64748B', fontWeight: '500', marginBottom: '20px', display: 'inline-block' }}>← Back to Events</Link>

            <div className="card" style={{ marginBottom: '30px' }}>
                <h2 style={{ margin: '0 0 15px 0' }}>{event.name}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                    <p style={{ margin: '5px 0' }}><strong>Date:</strong> {event.date}</p>
                    <p style={{ margin: '5px 0' }}><strong>Total Capacity:</strong> {event.capacity}</p>
                    <p style={{ margin: '5px 0' }}><strong>Registered:</strong> {attendees.length}</p>
                    <p style={{ margin: '5px 0' }}><strong>Available Seats:</strong> <span style={{ color: availableSeats === 0 ? '#EF4444' : '#10B981', fontWeight: 'bold' }}>{availableSeats}</span></p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                <div className="card" style={{ flex: '1', minWidth: '300px', alignSelf: 'flex-start' }}>
                    <h3 style={{ marginTop: 0 }}>Register</h3>

                    {error && <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
                    {success && <div style={{ backgroundColor: '#D1FAE5', color: '#047857', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{success}</div>}

                    {availableSeats === 0 ? (
                        <p style={{ color: '#EF4444', fontWeight: 'bold' }}>Registration closed.</p>
                    ) : (
                        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B' }}>Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B' }}>Email Address</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
                            </div>
                            <button type="submit" className="btn" style={{ marginTop: '10px' }}>Register Now</button>
                        </form>
                    )}
                </div>

                <div style={{ flex: '2', minWidth: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0 }}>Attendees</h3>
                        <input type="text" placeholder="Search attendees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '200px' }} />
                    </div>

                    {filteredAttendees.length === 0 ? (
                        <p style={{ color: '#64748B' }}>No attendees found.</p>
                    ) : (
                        <table>
                            <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                {showActionsColumn && <th>Actions</th>}
                            </tr>
                            </thead>
                            <tbody>
                            {filteredAttendees.map(a => (
                                <tr key={a.id}>
                                    <td>{a.name}</td>
                                    <td>{a.email}</td>
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