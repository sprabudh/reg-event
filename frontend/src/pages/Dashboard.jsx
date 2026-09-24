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
        <div className="dl-wrap">

            {/* Dynamic Sales & Marketing Hero Section */}
            <div className="dl-hero">
                <h1 className="dl-h1">
                    {userRole === 'ADMIN' ? 'Your Event Command Center' : 'Discover Your Next Experience'}
                </h1>
                <p className="dl-sub">
                    {userRole === 'ADMIN'
                        ? 'Seamlessly manage registrations, track capacity, and deliver unforgettable experiences to your attendees.'
                        : 'Browse our exclusive catalog, secure your spot, and get ready for unforgettable moments.'}
                </p>
            </div>

            {/* Central Focal Point: Core Metric & Call to Actions */}
            <div className="dl-metric-col">

                {/* Solitary Highlighted Metric */}
                <div className="dl-metric">
                    <h3 className="dl-metric-label">
                        Total Active Events
                    </h3>
                    <h2 className="dl-metric-value">
                        {totalEvents}
                    </h2>
                </div>

                {/* Primary Action Buttons */}
                <div className="dl-cta-row">
                    <Link to="/events" className="dl-btn-outline">
                        Browse Catalog
                    </Link>
                    {userRole === 'ADMIN' && (
                        <Link to="/create-event" className="dl-btn-solid">
                            Launch New Event
                        </Link>
                    )}
                </div>
            </div>

            {/* Recent Events Table */}
            <div className="dl-table-card">
                <div className="dl-table-head">
                    <h3 className="dl-table-title">
                        Latest Opportunities
                    </h3>
                </div>

                <div className="dl-scroll">
                    {recentEvents.length === 0 ? (
                        <p className="dl-empty">
                            No events currently scheduled. Check back soon!
                        </p>
                    ) : (
                        <table className="dl-table">
                            <thead>
                            <tr className="dl-thead">
                                <th className="dl-th">Event Name</th>
                                <th className="dl-th dl-th-c">Date</th>
                                <th className="dl-th dl-th-c">Capacity</th>
                                <th className="dl-th dl-th-r">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {recentEvents.map(event => (
                                <tr key={event.id} className="dl-row">
                                    <td className="dl-td-name">{event.name}</td>
                                    <td className="dl-td-c">{event.date}</td>
                                    <td className="dl-td-c">{event.capacity} seats</td>
                                    <td className="dl-td-r">
                                        <Link to={`/events/${event.id}`} className="dl-link">
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