/**
 * Every frontend URL path. Use these instead of raw strings so a path change
 * is a one-line edit here rather than a hunt across pages and the router.
 *
 * Note: the dashboard lives at "/", not "/dashboard".
 */

export const APP_ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    EVENTS: '/events',
    EVENT_DETAIL: '/events/:id',
    MY_TICKETS: '/my-tickets',
    CATEGORIES: '/categories',
    CREATE_EVENT: '/create-event',
    EDIT_EVENT: '/edit-event/:id',
    EDIT_ATTENDEE: '/edit-attendee/:id',
    ADMIN_SETUP: '/admin-setup',
    // Host role
    HOST_EVENTS: '/host/events',
    HOST_EVENT_DETAIL: '/host/events/:id',
    HOST_NEW_EVENT: '/host/events/new',
    HOST_EDIT_EVENT: '/host/events/:id/edit',

    // Admin approval queue
    ADMIN_APPROVALS: '/admin/approvals'
};

/** Builders for the parameterized routes above. */
export const buildEventDetailPath = (id) => `/events/${id}`;
export const buildEditEventPath = (id) => `/edit-event/${id}`;
export const buildEditAttendeePath = (id) => `/edit-attendee/${id}`;
export const buildHostEventPath = (id) => `/host/events/${id}`;
export const buildHostEditEventPath = (id) => `/host/events/${id}/edit`;
