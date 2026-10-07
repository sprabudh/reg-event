import { useEffect, useState } from 'react';
import { getEvents } from '../services/eventService';
import { getMyRegistrations } from '../services/attendeeService';
import { getApprovalCounts, getMyEvents } from '../services/hostService';
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

    // New states for Admin & Host specific metrics
    const [adminStats, setAdminStats] = useState({ ended: 0, pending: 0 });
    const [hostStats, setHostStats] = useState({ hosted: 0, pending: 0 });

    const userRole = getUserRole();
    const isAdmin = userRole === ROLES.ADMIN;
    const isHost = userRole === ROLES.HOST;
    const hero = isAdmin ? HERO[ROLES.ADMIN] : isHost ? HERO[ROLES.HOST] : HERO.default;

    useEffect(() => {
        // 1. Base fetches everyone needs
        const requests = [
            getEvents(PAGINATION.DEFAULT_PAGE, PAGINATION.LARGE_PAGE_SIZE),
            getMyRegistrations()
        ];

        // 2. Role-specific fetches to get accurate dashboard metrics
        if (isAdmin) {
            requests.push(getApprovalCounts());
        } else if (isHost) {
            requests.push(getMyEvents(PAGINATION.DEFAULT_PAGE, PAGINATION.LARGE_PAGE_SIZE));
        }

        Promise.all(requests)
            .then((responses) => {
                const [eventsRes, regRes, extraRes] = responses;
                const allEvents = eventsRes.data.content || [];

                // "Total Active Events" applies platform-wide: Only Approved AND Not Expired
                const activeEvents = allEvents.filter(
                    e => (!e.approvalStatus || e.approvalStatus === 'APPROVED') && !e.expired
                );
                setTotalEvents(activeEvents.length);

                // --- Admin Metrics Calculations ---
                if (isAdmin) {
                    const endedEventsCount = allEvents.filter(e => e.expired).length;
                    const pendingApprovalsCount = extraRes?.data?.events || 0;

                    setAdminStats({
                        ended: endedEventsCount,
                        pending: pendingApprovalsCount
                    });
                }
                // --- Host Metrics Calculations ---
                else if (isHost) {
                    const myEvents = extraRes?.data?.content || [];
                    const myHostedCount = myEvents.filter(e => !e.approvalStatus || e.approvalStatus === 'APPROVED').length;
                    const myPendingCount = myEvents.filter(e => e.approvalStatus === 'PENDING').length;

                    setHostStats({
                        hosted: myHostedCount,
                        pending: myPendingCount
                    });
                }

                const registeredIds = new Set((regRes.data || []).map(r => r.eventId));

                const opportunities = activeEvents
                    .filter(e => !registeredIds.has(e.id))
                    .sort((a, b) => b.id - a.id)
                    .slice(0, 4);

                setRecentEvents(opportunities);
            })
            .catch(error => console.error("Error fetching dashboard data:", error));
    }, [isAdmin, isHost]);

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
                {/* Flex container to place cards in the same row seamlessly */}
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px', width: '100%' }}>

                    {/* Universal Card */}
                    <div className="dl-metric" style={{ marginBottom: 0, flex: 1, minWidth: '220px', padding: '30px 20px' }}>
                        <h3 className="dl-metric-label">
                            Total Active Events
                        </h3>
                        <h2 className="dl-metric-value">
                            {totalEvents}
                        </h2>
                    </div>

                    {/* Admin-Only Cards */}
                    {isAdmin && (
                        <>
                            <div className="dl-metric" style={{ marginBottom: 0, flex: 1, minWidth: '220px', padding: '30px 20px' }}>
                                <h3 className="dl-metric-label">
                                    Ended Events
                                </h3>
                                <h2 className="dl-metric-value" style={{ color: '#64748B' }}>
                                    {adminStats.ended}
                                </h2>
                            </div>
                            <div className="dl-metric" style={{ marginBottom: 0, flex: 1, minWidth: '220px', padding: '30px 20px' }}>
                                <h3 className="dl-metric-label">
                                    Approval Pending
                                </h3>
                                <h2 className="dl-metric-value" style={{ color: '#D97706' }}>
                                    {adminStats.pending}
                                </h2>
                            </div>
                        </>
                    )}

                    {/* Host-Only Cards */}
                    {isHost && (
                        <>
                            <div className="dl-metric" style={{ marginBottom: 0, flex: 1, minWidth: '220px', padding: '30px 20px' }}>
                                <h3 className="dl-metric-label">
                                    My Hosted Events
                                </h3>
                                <h2 className="dl-metric-value" style={{ color: '#10B981' }}>
                                    {hostStats.hosted}
                                </h2>
                            </div>
                            <div className="dl-metric" style={{ marginBottom: 0, flex: 1, minWidth: '220px', padding: '30px 20px' }}>
                                <h3 className="dl-metric-label">
                                    Pending Requests
                                </h3>
                                <h2 className="dl-metric-value" style={{ color: '#D97706' }}>
                                    {hostStats.pending}
                                </h2>
                            </div>
                        </>
                    )}
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