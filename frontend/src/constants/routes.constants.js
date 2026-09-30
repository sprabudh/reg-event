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
    ADMIN_SETUP: '/admin-setup'
};

/** Builders for the parameterized routes above. */
export const buildEventDetailPath = (id) => `/events/${id}`;
export const buildEditEventPath = (id) => `/edit-event/${id}`;
export const buildEditAttendeePath = (id) => `/edit-attendee/${id}`;
