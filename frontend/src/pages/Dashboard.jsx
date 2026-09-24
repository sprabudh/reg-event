import { useEffect, useState } from 'react';
import { getEvents } from '../services/eventService';
import { getMyRegistrations } from '../services/attendeeService';
import { Link } from 'react-router-dom';
import { getUserRole } from '../services/authService';

const Dashboard = () => {
    const [totalEvents, setTotalEvents] = useState(0);
    const [recentEvents, setRecentEvents] = useState([]);
    const userRole = getUserRole();

    useEffect(() => {
        Promise.all([getEvents(0, 100), getMyRegistrations()])
            .then(([eventsRes, regRes]) => {
                const events = eventsRes.data.content || [];
                setTotalEvents(eventsRes.data.totalElements);

                const registeredIds = new Set((regRes.data || []).map(r => r.eventId));

                const opportunities = events
                    .filter(e => !e.expired && !registeredIds.has(e.id))
                    .sort((a, b) => b.id - a.id) // newest first
                    .slice(0, 4);

                setRecentEvents(opportunities);
            })
            .catch(error => console.error("Error fetching dashboard data:", error));
    }, []);

    return (
        <div style={{ padding: '50px 20px', maxWidth: '850px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif', textAlign: 'center' }}>

            {/* Dynamic Sales & Marketing Hero Section */}
            <div style={{ marginBottom: '40px' }}>
                <h1 style={{ color: '#111827', fontSize: '38px', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 12px 0' }}>
                    {userRole === 'ADMIN' ? 'Your Event Command Center' : 'Discover Your Next Experience'}
                </h1>
                <p style={{ color: '#6b7280', fontSize: '18px', maxWidth: '600px', margin: '0 auto', lineHeight: '1.5' }}>
                    {userRole === 'ADMIN'
                        ? 'Seamlessly manage registrations, track capacity, and deliver unforgettable experiences to your attendees.'
                        : 'Browse our exclusive catalog, secure your spot, and get ready for unforgettable moments.'}
                </p>
            </div>

            {/* Central Focal Point: Core Metric & Call to Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '60px' }}>

                {/* Solitary Highlighted Metric */}
                <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '30px 60px', boxShadow: '0 4px 10px rgba(0,0,0,0.04)', marginBottom: '30px' }}>
                    <h3 style={{ margin: '0 0 5px 0', color: '#6b7280', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>
                        Total Active Events
                    </h3>
                    <h2 style={{ margin: '0', fontSize: '56px', color: '#4f46e5', fontWeight: '900' }}>
                        {totalEvents}
                    </h2>
                </div>

                {/* Primary Action Buttons */}
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to="/events" style={{ padding: '14px 28px', backgroundColor: '#ffffff', color: '#374151', border: '1px solid #d1d5db', textDecoration: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', transition: 'all 0.2s' }}>
                        Browse Catalog
                    </Link>
                    {userRole === 'ADMIN' && (
                        <Link to="/create-event" style={{ padding: '14px 28px', backgroundColor: '#4f46e5', color: 'white', border: '1px solid #4f46e5', textDecoration: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)' }}>
                            Launch New Event
                        </Link>
                    )}
                </div>
            </div>

            {/* Recent Events Table */}
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.03)', overflow: 'hidden', textAlign: 'left' }}>
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', textAlign: 'center' }}>
                    <h3 style={{ margin: 0, color: '#374151', fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Latest Opportunities
                    </h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {recentEvents.length === 0 ? (
                        <p style={{ padding: '40px', margin: 0, color: '#6b7280', textAlign: 'center' }}>
                            No events currently scheduled. Check back soon!
                        </p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '16px 24px', color: '#9ca3af', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase' }}>Event Name</th>
                                <th style={{ padding: '16px 24px', color: '#9ca3af', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Date</th>
                                <th style={{ padding: '16px 24px', color: '#9ca3af', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', textAlign: 'center' }}>Capacity</th>
                                <th style={{ padding: '16px 24px', color: '#9ca3af', fontWeight: '600', fontSize: '12px', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {recentEvents.map(event => (
                                <tr key={event.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '18px 24px', color: '#111827', fontSize: '15px', fontWeight: '600' }}>{event.name}</td>
                                    <td style={{ padding: '18px 24px', color: '#4b5563', fontSize: '14px', textAlign: 'center' }}>{event.date}</td>
                                    <td style={{ padding: '18px 24px', color: '#4b5563', fontSize: '14px', textAlign: 'center' }}>{event.capacity} seats</td>
                                    <td style={{ padding: '18px 24px', textAlign: 'right' }}>
                                        <Link to={`/events/${event.id}`} style={{ color: '#4f46e5', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                                            Secure Spot &rarr;
                                        </Link>
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

export default Dashboard;