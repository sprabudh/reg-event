import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById, getEventStats } from '../services/eventService';
import { getAttendeesByEvent, registerAttendee, deleteAttendee, checkInAttendee } from '../services/attendeeService';
import { getUserRole, getUserEmail } from '../services/authService';

const EventDetails = () => {
    const { id } = useParams();

    const [event, setEvent] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [stats, setStats] = useState({ capacity: 0, registered: 0, available: 0 });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({ name: '', email: '', mobileNumber: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const userRole = getUserRole();
    const userEmail = getUserEmail();

    useEffect(() => {
        loadEventDetails();
        loadAttendees();
        loadEventStats();
    }, [id]);

    const loadEventDetails = () => {
        getEventById(id).then(res => setEvent(res.data)).catch(err => console.error(err));
    };

    const loadEventStats = () => {
        getEventStats(id).then(res => setStats(res.data)).catch(err => console.error(err));
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
                if (res.data && res.data.status === 'WAITLISTED') {
                    setSuccess('Event is full. You have been added to the waitlist!');
                } else {
                    setSuccess('Successfully registered! Your ticket has been generated.');
                }
                setFormData({ name: '', email: '' });
                loadEventDetails();
                loadAttendees();
                loadEventStats();
            })
            .catch((err) => {
                setError(err.response?.data?.message || 'Registration failed. Please try again.');
            });
    };

    const handleDeleteAttendee = (attendeeId) => {
        const message = userRole === 'ADMIN' ? "Remove this attendee?" : "Cancel your registration?";
        if (window.confirm(message)) {
            deleteAttendee(attendeeId).then(() => {
                loadEventDetails();
                loadAttendees();
                loadEventStats();
                setSuccess('Registration removed successfully.');
            }).catch(console.error);
        }
    };

    // FIX: Safely handle the check-in process
    const handleCheckIn = (attendee) => {
        setError('');
        setSuccess('');

        // Prevent crash if it's a legacy user without a ticket UUID
        if (!attendee.ticketUuid) {
            setError('Check-in failed: This attendee was registered before the ticketing system was added and has no valid ticket ID.');
            return;
        }

        checkInAttendee(id, attendee.ticketUuid)
            .then(() => {
                setSuccess(`${attendee.name} has been successfully checked in!`);
                loadAttendees();
                loadEventStats();
            })
            .catch(err => setError(err.response?.data?.message || 'Check-in failed. Please try again.'));
    };

    if (!event) return <div style={{ padding: '20px' }}>Loading...</div>;

    const filteredAttendees = attendees.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedAttendees = [...filteredAttendees].sort((a, b) => {
        const statusA = a.status || 'CONFIRMED';
        const statusB = b.status || 'CONFIRMED';
        if (statusA === 'CONFIRMED' && statusB === 'WAITLISTED') return -1;
        if (statusA === 'WAITLISTED' && statusB === 'CONFIRMED') return 1;
        return 0;
    });

    return (
        <div>
            <Link to="/events" style={{ textDecoration: 'none', color: '#64748B', fontWeight: '500', marginBottom: '20px', display: 'inline-block' }}>← Back to Events</Link>

            <div className="card" style={{ marginBottom: '20px', padding: '24px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h2 style={{ marginTop: 0, fontSize: '28px', color: '#111827' }}>{event.name}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', fontSize: '15px', color: '#4b5563', marginTop: '20px' }}>
                    <p style={{ margin: '5px 0' }}><strong>Date:</strong> {event.date}</p>
                    <p style={{ margin: '5px 0' }}><strong>Time:</strong> {event.time || 'TBA'}</p>
                    <p style={{ margin: '5px 0' }}><strong>Duration:</strong> {event.duration || 'TBA'}</p>
                    <p style={{ margin: '5px 0' }}><strong>Price:</strong> {!event.price || event.price === 0 ? <span style={{ color: '#10b981', fontWeight: 'bold' }}>Free</span> : `₹${event.price}`}</p>                    {event.isOnline ? (
                        <p style={{ margin: '5px 0' }}><strong>Location:</strong> <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>Online Event</span></p>
                    ) : (
                        <p style={{ margin: '5px 0' }}><strong>Location:</strong> {event.location || 'TBA'}</p>
                    )}
                    <p style={{ margin: '5px 0' }}><strong>Cancellation:</strong> {event.isRefundable ? 'Refund Available' : 'No Refund'}</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, padding: '20px', backgroundColor: '#e0e7ff', borderRadius: '8px', border: '1px solid #c7d2fe', minWidth: '200px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#3730a3', fontSize: '14px', textTransform: 'uppercase' }}>Total Registrations</h4>
                    <p style={{ fontSize: '28px', margin: 0, fontWeight: 'bold', color: '#312e81' }}>{stats.registered} / {stats.capacity}</p>
                </div>
                <div style={{ flex: 1, padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #a7f3d0', minWidth: '200px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#065f46', fontSize: '14px', textTransform: 'uppercase' }}>Available Seats</h4>
                    <p style={{ fontSize: '28px', margin: 0, fontWeight: 'bold', color: '#064e3b' }}>{stats.available}</p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

                <div className="card" style={{ flex: '1', minWidth: '300px', alignSelf: 'flex-start' }}>
                    <h3 style={{ marginTop: 0 }}>Register</h3>

                    {error && <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{error}</div>}
                    {success && <div style={{ backgroundColor: '#D1FAE5', color: '#047857', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>{success}</div>}

                    <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B' }}>Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>

                        {/* NEW: Mobile Number Field */}
                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B' }}>Mobile Number</label>
                            <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required placeholder="10-digit mobile number" style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }} />
                        </div>

                        <div>
                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B' }}>Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}/>
                        </div>
                        <button type="submit" className="btn" style={{ marginTop: '10px', width: '100%', backgroundColor: stats.available === 0 ? '#d97706' : '#4f46e5' }}>
                            {stats.available > 0 ? 'Register Now' : 'Join Waitlist'}
                        </button>
                    </form>
                </div>

                <div style={{ flex: '2', minWidth: '400px' }}>
                    {userRole === 'ADMIN' ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                <h3 style={{ margin: 0 }}>All Attendees (Admin View)</h3>
                                <input type="text" placeholder="Search attendees..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '200px', padding: '6px', borderRadius: '4px', border: '1px solid #ccc' }} />
                            </div>

                            {sortedAttendees.length === 0 ? (
                                <p style={{ color: '#64748B' }}>No attendees found.</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                    <tr style={{ backgroundColor: '#1e293b', color: 'white', textAlign: 'left' }}>
                                        <th style={{ padding: '12px' }}>Name</th>
                                        <th style={{ padding: '12px' }}>Email</th>
                                        <th style={{ padding: '12px' }}>Status</th>
                                        <th style={{ padding: '12px' }}>Actions</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {sortedAttendees.map(a => {
                                        // Visual handling for different statuses
                                        let statusColor = '#16a34a'; // CONFIRMED
                                        let bgColor = '#dcfce3';
                                        if (a.status === 'WAITLISTED') {
                                            statusColor = '#d97706'; bgColor = '#fef3c7';
                                        } else if (a.status === 'CHECKED_IN') {
                                            statusColor = '#4f46e5'; bgColor = '#e0e7ff';
                                        }

                                        return (
                                            <tr key={a.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                                <td style={{ padding: '12px' }}>{a.name}</td>
                                                <td style={{ padding: '12px' }}>{a.email}</td>
                                                <td style={{ padding: '12px' }}>
                                                <span style={{ color: statusColor, fontWeight: '600', backgroundColor: bgColor, padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                                                    {a.status || 'CONFIRMED'}
                                                </span>
                                                </td>
                                                {/* FIX: Cleaned up Action Buttons */}
                                                <td style={{ padding: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    {a.status === 'CONFIRMED' && (
                                                        <button
                                                            onClick={() => handleCheckIn(a)}
                                                            disabled={!a.ticketUuid}
                                                            title={!a.ticketUuid ? "Legacy User: No Ticket UUID" : "Check In Attendee"}
                                                            style={{
                                                                padding: '6px 10px',
                                                                backgroundColor: a.ticketUuid ? '#3b82f6' : '#9ca3af',
                                                                color: 'white', border: 'none', borderRadius: '4px',
                                                                cursor: a.ticketUuid ? 'pointer' : 'not-allowed'
                                                            }}>
                                                            Check In
                                                        </button>
                                                    )}
                                                    <Link to={`/edit-attendee/${a.id}`} className="btn btn-small btn-secondary" style={{ padding: '6px 10px' }}>Edit</Link>
                                                    <button onClick={() => handleDeleteAttendee(a.id)} className="btn btn-small btn-danger" style={{ padding: '6px 10px', border: 'none', cursor: 'pointer' }}>Delete</button>
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            )}
                        </>
                    ) : (
                        <div className="card" style={{ padding: '25px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>My Registration Status</h3>
                            {attendees.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <p style={{ fontSize: '16px', color: '#334155' }}>Your current status for this event is:
                                        <span style={{
                                            marginLeft: '10px',
                                            color: attendees[0].status === 'WAITLISTED' ? '#d97706' : (attendees[0].status === 'CHECKED_IN' ? '#4f46e5' : '#16a34a'),
                                            fontWeight: '600',
                                            backgroundColor: attendees[0].status === 'WAITLISTED' ? '#fef3c7' : (attendees[0].status === 'CHECKED_IN' ? '#e0e7ff' : '#dcfce3'),
                                            padding: '6px 12px',
                                            borderRadius: '12px'
                                        }}>
                                            {attendees[0].status || 'CONFIRMED'}
                                        </span>
                                    </p>

                                    {attendees[0].qrCodeBase64 && (
                                        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '8px', textAlign: 'center', alignSelf: 'stretch' }}>
                                            <h4 style={{ margin: '0 0 10px 0', color: '#475569' }}>Your Entry Ticket</h4>
                                            <img src={attendees[0].qrCodeBase64} alt="QR Code Ticket" style={{ width: '150px', height: '150px' }} />
                                            <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                ID: {attendees[0].ticketUuid}
                                            </p>
                                        </div>
                                    )}

                                    {attendees[0].status !== 'CHECKED_IN' && (
                                        <button
                                            onClick={() => handleDeleteAttendee(attendees[0].id)}
                                            style={{ marginTop: '20px', padding: '10px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}
                                        >
                                            Cancel My Registration
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p style={{ color: '#64748B', fontSize: '15px' }}>You have not registered for this event yet. Use the form to secure your spot or join the waitlist.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetails;