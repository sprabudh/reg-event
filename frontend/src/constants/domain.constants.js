

export const REGISTRATION_STATUS = {
    CONFIRMED: 'CONFIRMED',
    WAITLISTED: 'WAITLISTED',
    CHECKED_IN: 'CHECKED_IN'
};

export const REFUND_STATUS = {
    NONE: 'NONE',
    REFUNDED: 'REFUNDED',
    FORFEITED: 'FORFEITED'
};

export const APPROVAL_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
};


export const PAGINATION = {
    DEFAULT_PAGE: 0,
    EVENTS_PAGE_SIZE: 15,
    ATTENDEES_PAGE_SIZE: 30,
    LARGE_PAGE_SIZE: 40
};

export const MOBILE_REGEX = /^\d{10}$/;

export const FORM_LABELS = {
    FULL_NAME: 'Full Name',
    ADMIN_FULL_NAME: 'Admin Full Name',
    EMAIL: 'Email Address',
    ADMIN_EMAIL: 'Admin Email Address',
    PASSWORD: 'Password',
    CONFIRM_PASSWORD: 'Confirm Password',
    MOBILE_NUMBER: 'Mobile Number',
    CATEGORY_NAME: 'New category name'
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
    ADMIN_CTA: 'Create Admin Account'
};

/** Nav + footer copy in the layout. */
export const NAV_LABELS = {
    BRAND: 'Eventora',
    DASHBOARD: 'Dashboard',
    EVENTS: 'Events',
    MY_TICKETS: 'My Tickets',
    CATEGORIES: 'Categories',
    MY_EVENTS: 'My Events',
    APPROVALS: 'Approvals',
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


export const STATUS_BADGE_CLASSES = {
    [REGISTRATION_STATUS.CONFIRMED]: 'bd-green',
    [REGISTRATION_STATUS.WAITLISTED]: 'bd-orange',
    [REGISTRATION_STATUS.CHECKED_IN]: 'bd-indigo'
};

export const DEFAULT_STATUS_BADGE_CLASS = 'bd-default';

/** Initial/empty shape for the event stats object. */
export const EMPTY_EVENT_STATS = { capacity: 0, registered: 0, available: 0 };

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

/**
 * Badge class per approval status. Module-private: callers use the helper
 * below, which keeps the original inline lookups' fallback to 'bd-default'
 * for any unrecognised status.
 */
const APPROVAL_BADGE_CLASSES = {
    [APPROVAL_STATUS.PENDING]: 'bd-orange',
    [APPROVAL_STATUS.APPROVED]: 'bd-green',
    [APPROVAL_STATUS.REJECTED]: 'bd-indigo'
};

export const getApprovalBadgeClass = (status) =>
    APPROVAL_BADGE_CLASSES[status] || DEFAULT_STATUS_BADGE_CLASS;
