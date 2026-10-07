/**
 * All user-facing copy: confirm-dialog prompts, catch-block errors, and
 * success toasts. Keeps wording consistent and editable in one place.
 */

export const PROMPTS = {
    LOGOUT: 'Are you sure you want to log out of Eventora?',
    DELETE_EVENT: 'Are you sure you want to delete this event?',
    DELETE_CATEGORY: 'Delete this category?',
    REMOVE_ATTENDEE: 'Remove this attendee?',
    CANCEL_REGISTRATION: 'Cancel your registration?',
    /** Takes the event name so the prompt names what is being cancelled. */
    cancelRegistrationFor: (eventName) => `Cancel your registration for "${eventName || 'this event'}"?`
};

/**
 * Button text for ConfirmDialog. Separate from PROMPTS because those are
 * written as questions ("Remove this attendee?") and read wrong on a button.
 * Pages pass the specific label so the action is named, not generic.
 */
export const CONFIRM_LABELS = {
    DEFAULT_TITLE: 'Are you sure?',
    CANCEL: 'Cancel',
    CONFIRM: 'Confirm',
    LOGOUT: 'Logout',
    DELETE_EVENT: 'Delete Event',
    DELETE_CATEGORY: 'Delete Category',
    CANCEL_REGISTRATION: 'Cancel Registration',
    REMOVE_ATTENDEE: 'Remove Attendee'
};

export const ERROR_MESSAGES = {
    AUTH_FAILED: 'Invalid email or password.',
    EMAIL_FORMAT: "Enter a valid email address.",
    PASSWORD_FORMAT: 'Password requires 8+ characters, 1 uppercase, 1 lowercase, 1 number, and 1 symbol.',
    PASSWORD_MISMATCH: 'Passwords do not match',
    PASSWORD_MATCH: 'Passwords match',
    REGISTRATION_FAILED: 'User Exits, Try a different email.',
    ADMIN_REGISTRATION_FAILED: 'Admin registration failed. Try a different email.',
    ATTENDEE_REGISTRATION_FAILED: 'Registration failed. Please try again.',
    MOBILE_INVALID: 'Mobile number must be exactly 10 digits.',
    LOAD_EVENTS_FAILED: 'Failed to delete event.',
    LOAD_EVENT_DETAILS_FAILED: 'Failed to load event details.',
    SAVE_EVENT_FAILED: (verb) => `Failed to ${verb} event.`,
    LOAD_TICKETS_FAILED: 'Failed to load your tickets. Please try again later.',
    CANCEL_REGISTRATION_FAILED: 'Failed to cancel registration. Please try again.',
    LOAD_ATTENDEE_FAILED: 'Failed to load attendee data.',
    UPDATE_ATTENDEE_FAILED: 'Failed to update attendee. Check your inputs.',
    LOAD_CATEGORIES_FAILED: 'Failed to load',
    ADD_CATEGORY_FAILED: 'Failed to add category',
    DELETE_CATEGORY_IN_USE: 'Cannot delete category in use.',
    LEGACY_TICKET_NO_UUID: 'Check-in failed: This attendee was registered before the ticketing system was added and has no valid ticket ID.',
    CHECK_IN_FAILED: 'Check-in failed. Please try again.'
};

export const SUCCESS_MESSAGES = {
    REGISTER_OK: 'Successfully registered! Your ticket has been generated.',
    WAITLIST_OK: 'Event is full. You have been added to the waitlist!',
    CANCEL_REGISTRATION_OK: 'Registration cancelled successfully.',
    REGISTRATION_REMOVED: 'Registration removed successfully.',
    CHECK_IN_OK: (name) => `${name} has been successfully checked in!`
};

/**
 * Copy for the 403 page. Kept here with the rest of the user-facing strings so
 * the wording is editable in one place.
 */
export const ACCESS_DENIED_LABELS = {
    CODE: '403',
    TITLE: 'Access Denied',
    MESSAGE: 'This page is restricted to administrators. Your account does not have the required permissions to view it.',
    CONTACT: 'If you believe you should have access, please contact an administrator.',
    SIGNED_IN_AS: 'Signed in as',
    CURRENT_ROLE: 'Your role',
    REQUIRES_ROLE: 'Requires role',
    PAGE: 'Page',
    NO_ROLE: 'No role assigned',
    BACK_HOME: 'Back to Dashboard',
    BROWSE_EVENTS: 'Browse Events'
};
