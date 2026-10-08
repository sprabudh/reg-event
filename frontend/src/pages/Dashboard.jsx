import { useEffect, useState } from 'react';
import { getEvents } from '../services/eventService';
import { getMyRegistrations } from '../services/attendeeService';
import { getApprovalCounts, getMyEvents } from '../services/hostService';
import { Link } from 'react-router-dom';
import { getUserRole } from '../services/authService';
import {
    APP_ROUTES,
    APPROVAL_STATUS,
    ERROR_MESSAGES,
    PAGINATION,
    ROLES,
    buildEventDetailPath
} from '../constants';
import { getErrorMessage } from '../utils/errors';

/**
 * Rows shown in "Latest Opportunities". Kept small so the dashboard fits a
 * single screen without the page scrolling; the list scrolls inside its card
 * if it ever needs to hold more.
 */
const DASHBOARD_OPPORTUNITY_COUNT = 4;

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

    // Admin & Host specific metrics
    const [adminStats, setAdminStats] = useState({ ended: 0, pending: 0 });
    const [hostStats, setHostStats] = useState({ hosted: 0, pending: 0 });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    // Null means "no server count available", so the local page count is used.
    const [activeEventTotal, setActiveEventTotal] = useState(null);

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

        // allSettled, not all: one failing request (e.g. the role-specific call)
        // used to discard every other metric and leave the page showing zeros
        // plus "No events currently scheduled" with no indication anything broke.
        Promise.allSettled(requests)
            .then((results) => {
                const eventsRes = results[0];
                const regRes = results[1];
                const extraRes = results[2];

                if (eventsRes.status === 'rejected') {
                    setError(getErrorMessage(eventsRes.reason, ERROR_MESSAGES.LOAD_EVENTS_FAILED));
                    return;
                }
                setError('');

                const allEvents = eventsRes.value.data.content || [];

                // "Total Active Events" applies platform-wide: Only Approved AND Not Expired
                const activeEvents = allEvents.filter(
                    e => (!e.approvalStatus || e.approvalStatus === APPROVAL_STATUS.APPROVED) && !e.expired
                );
                setTotalEvents(activeEvents.length);
                // For non-admins the server already filters expired events out
                // (EventController passes includeExpired=false), so its total
                // counts exactly the active events. For admins that flag is true
                // and the total would include ended events, so keep the local count.
                setActiveEventTotal(
                    isAdmin ? null : (eventsRes.value.data.totalElements ?? activeEvents.length)
                );

                if (isAdmin) {
                    const endedEventsCount = allEvents.filter(e => e.expired).length;
                    const pendingApprovalsCount = extraRes?.status === 'fulfilled' ? (extraRes.value.data?.events || 0) : 0;

                    setAdminStats({
                        ended: endedEventsCount,
                        pending: pendingApprovalsCount
                    });
                } else if (isHost) {
                    const myEvents = extraRes?.status === 'fulfilled' ? (extraRes.value.data?.content || []) : [];
                    const myHostedCount = myEvents.filter(e => !e.approvalStatus || e.approvalStatus === APPROVAL_STATUS.APPROVED).length;
                    const myPendingCount = myEvents.filter(e => e.approvalStatus === APPROVAL_STATUS.PENDING).length;

                    setHostStats({
                        hosted: myHostedCount,
                        pending: myPendingCount
                    });
                }

                const registeredIds = new Set(
                    (regRes?.status === 'fulfilled' ? (regRes.value.data || []) : []).map(r => r.eventId)
                );

                const opportunities = activeEvents
                    .filter(e => !registeredIds.has(e.id))
                    .sort((a, b) => b.id - a.id)
                    .slice(0, DASHBOARD_OPPORTUNITY_COUNT);

                setRecentEvents(opportunities);
            })
            .catch((error) => {
                setError(getErrorMessage(error, ERROR_MESSAGES.LOAD_EVENTS_FAILED));
            })
            .finally(() => setLoading(false));
    }, [isAdmin, isHost]);

    if (loading) return <div className="page-loading">Loading your dashboard...</div>;

    return (
        <div className="dl-wrap">
            {error && <div className="alert-error" role="alert">{error}</div>}

            <div className="dl-hero">
                <h1 className="dl-h1">
                    {hero.title}
                </h1>
                <p className="dl-sub">
                    {hero.subtitle}
                </p>
            </div>

            <div className="dl-metric-col">
                {/* Hero metric: full width so the headline number reads as the
                    primary figure, with the role-specific pair compact below. */}
                <div className="dl-metric-hero">
                    <h3 className="dl-metric-label">
                        Total Active Events
                    </h3>
                    <div className="dl-metric-hero-value">
                        {activeEventTotal ?? totalEvents}
                    </div>
                </div>

                {/* Attendees have no role metrics, so the row is omitted rather
                    than rendered as an empty strip of space. */}
                {(isAdmin || isHost) && (
                <div className="dl-metric-row">
                    {isAdmin && (
                        <>
                            <div className="dl-metric dl-metric-sm">
                                <h3 className="dl-metric-label">
                                    Ended Events
                                </h3>
                                <div className="dl-metric-value dl-metric-value-sm dl-muted-value">
                                    {adminStats.ended}
                                </div>
                            </div>
                            <div className="dl-metric dl-metric-sm">
                                <h3 className="dl-metric-label">
                                    Approval Pending
                                </h3>
                                <div className="dl-metric-value dl-metric-value-sm dl-warn-value">
                                    {adminStats.pending}
                                </div>
                            </div>
                        </>
                    )}

                    {isHost && (
                        <>
                            <div className="dl-metric dl-metric-sm">
                                <h3 className="dl-metric-label">
                                    My Hosted Events
                                </h3>
                                <div className="dl-metric-value dl-metric-value-sm dl-ok-value">
                                    {hostStats.hosted}
                                </div>
                            </div>
                            <div className="dl-metric dl-metric-sm">
                                <h3 className="dl-metric-label">
                                    Pending Requests
                                </h3>
                                <div className="dl-metric-value dl-metric-value-sm dl-warn-value">
                                    {hostStats.pending}
                                </div>
                            </div>
                        </>
                    )}
                </div>
                )}

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