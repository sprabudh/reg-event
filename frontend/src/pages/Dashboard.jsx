import { useEffect, useState } from 'react';
import { getEvents } from '../services/eventService';
import { getMyRegistrations } from '../services/attendeeService';
import { Link } from 'react-router-dom';
import { getUserRole } from '../services/authService';
import {
    APP_ROUTES,
    PAGINATION,
    ROLES,
    buildEventDetailPath
} from '../constants';

const HERO = {
    [ROLES.ADMIN]: {
        title: 'Your Event Command Center',
        subtitle: 'Seamlessly manage registrations, track capacity, and deliver unforgettable experiences to your attendees.'
    },
    [ROLES.HOST]: {
        title: 'Bring Your Vision to Life',
        subtitle: 'Submit events for review, track approval status, and manage attendees for the events you host.'
    },
    default: {
        title: 'Discover Your Next Experience',
        subtitle: 'Browse our exclusive catalog, secure your spot, and get ready for unforgettable moments.'
    }
};

const Dashboard = () => {
    const [totalEvents, setTotalEvents] = useState(0);
    const [recentEvents, setRecentEvents] = useState([]);
    const userRole = getUserRole();
    const isAdmin = userRole === ROLES.ADMIN;
    const isHost = userRole === ROLES.HOST;
    const hero = isAdmin ? HERO[ROLES.ADMIN] : isHost ? HERO[ROLES.HOST] : HERO.default;

    useEffect(() => {
        Promise.all([
            getEvents(PAGINATION.DEFAULT_PAGE, PAGINATION.LARGE_PAGE_SIZE),
            getMyRegistrations()
        ])
            .then(([eventsRes, regRes]) => {
                const allEvents = eventsRes.data.content || [];
                // Only count and display APPROVED events (legacy rows have null approvalStatus)
                const approvedEvents = allEvents.filter(
                    e => !e.approvalStatus || e.approvalStatus === 'APPROVED'
                );

                setTotalEvents(approvedEvents.length);

                const registeredIds = new Set((regRes.data || []).map(r => r.eventId));

                const opportunities = approvedEvents
                    .filter(e => !e.expired && !registeredIds.has(e.id))
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 4);

                setRecentEvents(opportunities);
            })
            .catch(error => console.error("Error fetching dashboard data:", error));
    }, []);

    return (
        <div className="dl-wrap">
            <div className="dl-hero">
                <h1 className="dl-h1">
                    {hero.title}
                </h1>
                <p className="dl-sub">
                    {hero.subtitle}
                </p>
            </div>

            <div className="dl-metric-col">
                <div className="dl-metric">
                    <h3 className="dl-metric-label">
                        Total Active Events
                    </h3>
                    <h2 className="dl-metric-value">
                        {totalEvents}
                    </h2>
                </div>

                <div className="dl-cta-row">
                    <Link to={APP_ROUTES.EVENTS} className="dl-btn-outline">
                        Browse Catalog
                    </Link>
                    {isAdmin && (
                        <Link to={APP_ROUTES.CREATE_EVENT} className="dl-btn-solid">
                            Launch New Event
                        </Link>
                    )}
                    {isHost && (
                        <Link to={APP_ROUTES.HOST_NEW_EVENT} className="dl-btn-solid">
                            Request an Event
                        </Link>
                    )}
                </div>
            </div>

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
                            <tbody>
                            {recentEvents.map(event => (
                                <tr key={event.id} className="dl-row">
                                    <td className="dl-td-name">{event.name}</td>
                                    <td className="dl-td-c">{event.date}</td>
                                    <td className="dl-td-c">{event.capacity} seats</td>
                                    <td className="dl-td-r">
                                        <Link to={buildEventDetailPath(event.id)} className="dl-link">
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