/**
 * Backend endpoint paths, all relative to API_BASE_URL (which already
 * includes the /api prefix the Spring controllers are mapped under).
 */

export const API_BASE_URL = 'http://localhost:8080/api';

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/authenticate',
        REGISTER_USER: '/auth/register',
        REGISTER_ADMIN: '/auth/register-admin'
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
    }
};
