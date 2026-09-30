/**
 * Domain vocabulary that is repeated across pages: the status enums the
 * backend returns, page-size defaults, and shared form/table labels.
 *
 * The status values mirror com.example.eventreg.entity.RegistrationStatus
 * and RefundStatus on the backend -- keep them in sync.
 */

export const REGISTRATION_STATUS = {
    CONFIRMED: 'CONFIRMED',
    WAITLISTED: 'WAITLISTED',
    CHECKED_IN: 'CHECKED_IN',
    NOT_IN: 'NOT_IN'
};

export const REFUND_STATUS = {
    NONE: 'NONE',
    REFUNDED: 'REFUNDED',
    FORFEITED: 'FORFEITED'
};

/** Default page sizes. EventsList uses 15 (3 rows of 5 cards). */
export const PAGINATION = {
    DEFAULT_PAGE: 0,
    EVENTS_PAGE_SIZE: 15,
    LARGE_PAGE_SIZE: 100
};

export const MOBILE_REGEX = /^\d{10}$/;

export const FORM_LABELS = {
    FULL_NAME: 'Full Name',
    ADMIN_FULL_NAME: 'Admin Full Name',
    EMAIL: 'Email Address',
    ADMIN_EMAIL: 'Admin Email Address',
    PASSWORD: 'Password',
    CONFIRM_PASSWORD: 'Confirm Password',
    MOBILE_NUMBER: 'Mobile Number'
};

/** Headings and button text on the auth pages. */
export const PAGE_LABELS = {
    BRAND: 'Eventora',
    LOGIN_SUBTITLE: 'Welcome Back!',
    REGISTER_SUBTITLE: 'Join us today',
    ADMIN_SUBTITLE: 'Create an elevated access account.',
    ADMIN_TITLE: 'Admin Setup Portal',
    LOGIN_CTA: 'Login',
    REGISTER_CTA: 'Register',
    ADMIN_CTA: 'Create Admin Account',
    LOGIN_LOADING: 'Signing in...',
    REGISTER_LOADING: 'Creating account...'
};

/** Nav + footer copy in the layout. */
export const NAV_LABELS = {
    BRAND: 'Eventora',
    DASHBOARD: 'Dashboard',
    EVENTS: 'Events',
    MY_TICKETS: 'My Tickets',
    CATEGORIES: 'Categories',
    LOGIN: 'Login',
    LOGOUT: 'Logout',
    GREETING: (name) => `Hi, ${name || 'User'}!`,
    FOOTER: (year) => `© ${year} Eventora. Book your spot, bring your friends.`
};

export const TABLE_HEADERS = {
    ATTENDEES: ['Name', 'Email', 'Status', 'Amount', 'Invoice', 'Payment', 'Actions'],
    REFUNDS: ['Attendee', 'Amount', 'Invoice', 'Date of Registration', 'Refund Status', 'Date of Cancellation'],
    DASHBOARD_EVENTS: ['Event Name', 'Date', 'Capacity', 'Action']
};

/** Badge class per registration status, used by MyTickets. */
export const STATUS_BADGE_CLASSES = {
    [REGISTRATION_STATUS.CONFIRMED]: 'bd-green',
    [REGISTRATION_STATUS.CHECKED_IN]: 'bd-indigo'
};

export const DEFAULT_STATUS_BADGE_CLASS = 'bd-default';

/**
 * Status -> class maps for the EventDetails admin table and the user-facing
 * "your registration status" pill. Module-private: callers use the two
 * helpers below, which keep the original inline lookups' fallback to the
 * CONFIRMED styling for any unrecognised status (e.g. NOT_IN).
 */
const ATTENDEE_STATUS_BADGE_CLASSES = {
    [REGISTRATION_STATUS.CONFIRMED]: 'ed-badge-green',
    [REGISTRATION_STATUS.WAITLISTED]: 'ed-badge-orange',
    [REGISTRATION_STATUS.CHECKED_IN]: 'ed-badge-indigo'
};

const ATTENDEE_STATUS_INLINE_CLASSES = {
    [REGISTRATION_STATUS.CONFIRMED]: 'ed-status-confirmed',
    [REGISTRATION_STATUS.WAITLISTED]: 'ed-status-waitlist',
    [REGISTRATION_STATUS.CHECKED_IN]: 'ed-status-checkedin'
};

export const getAttendeeBadgeClass = (status) =>
    ATTENDEE_STATUS_BADGE_CLASSES[status] || ATTENDEE_STATUS_BADGE_CLASSES[REGISTRATION_STATUS.CONFIRMED];

export const getAttendeeStatusClass = (status) =>
    ATTENDEE_STATUS_INLINE_CLASSES[status] || ATTENDEE_STATUS_INLINE_CLASSES[REGISTRATION_STATUS.CONFIRMED];
