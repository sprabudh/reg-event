/**
 * Backend endpoint paths, all relative to API_BASE_URL (which already
 * includes the /api prefix the Spring controllers are mapped under).
 */

export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/authenticate',
        REGISTER_USER: '/auth/register',
        REGISTER_ADMIN: '/auth/register-admin',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout'
    },
    EVENTS: {
        BASE: '/events',
        BY_ID: (id) => `/events/${id}`,
        STATS: (id) => `/events/${id}/stats`,
        PAYMENTS: (id) => `/events/${id}/payments`
    },
    CATEGORIES: {
        BASE: '/categories',
        BY_ID: (id) => `/categories/${id}`
    },
    ATTENDEES: {
        REGISTER: (eventId) => `/events/${eventId}/attendees`,
        BY_EVENT: (eventId) => `/events/${eventId}/attendees`,
        CHECK_IN: (eventId, ticketUuid) => `/events/${eventId}/checkin/${ticketUuid}`,
        ME: '/attendees/me',
        MY_REGISTRATIONS: '/attendees/me/registrations',
        BY_ID: (id) => `/attendees/${id}`
    },


    HOST: {
        EVENTS: '/host/events',
        EVENT_BY_ID: (id) => `/host/events/${id}`,
        MY_EVENTS: '/host/events',
        ATTENDEES: (eventId) => `/host/events/${eventId}/attendees`,
        PAYMENTS: (eventId) => `/host/events/${eventId}/payments`,
        CHECK_IN: (eventId, ticketUuid) => `/host/events/${eventId}/checkin/${ticketUuid}`,
        CANCEL_ATTENDEE: (attendeeId) => `/host/events/attendees/${attendeeId}`
    },

    /** Admin approval queue, under /api/admin/** (hasAuthority("ADMIN")). */
    ADMIN: {
        EVENT_APPROVALS: '/admin/approvals/events',
        APPROVE_EVENT: (id) => `/admin/approvals/events/${id}/approve`,
        REJECT_EVENT: (id) => `/admin/approvals/events/${id}/reject`,
        COUNTS: '/admin/approvals/counts'
    }


};
