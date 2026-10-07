/**
 * Single source of truth for anything auth-related:
 * localStorage keys, roles, and shared validation patterns.
 *
 * NOTE: never re-export these from a .jsx file -- eslint's react-refresh
 * rule breaks fast refresh when a component file also exports plain values.
 */

export const STORAGE_KEYS = {
    TOKEN: 'token',
    ROLE: 'role',
    USER_NAME: 'userName'
};

/** Every key we own, so logout can never drift out of sync. */
export const ALL_STORAGE_KEYS = Object.values(STORAGE_KEYS);

/** Mirrors com.example.eventreg.user.Role on the backend. */
export const ROLES = {
    ADMIN: 'ADMIN',
    USER: 'USER',
    HOST: 'HOST'
};

/**
 * Which account type the Register page offers. Sent as `accountType` and
 * mapped to a role server-side by AuthService.resolveRegisterRole.
 * Kept distinct from ROLES because the wire value is a UI concept, not an
 * authority string.
 */
export const ACCOUNT_TYPES = {
    ATTENDEE: 'ATTENDEE',
    HOST: 'HOST'
};

/**
 * Host signups must use this domain. MUST stay in step with
 * application.security.auth.host-email-domain on the backend, which enforces
 * the same rule -- this copy only saves the user a round trip.
 */
export const HOST_EMAIL_SUFFIX = '@eventora.com';

export const HOST_EMAIL_ERROR = 'Host accounts must use an @eventora.com email address.';

/** Shown once the host email is acceptable, so the check feels live. */
export const HOST_EMAIL_OK = 'Host email accepted.';

/**
 * Short human label for the signed-in role, shown in the header so the user
 * can see which door they came through.
 */
export const ROLE_LABELS = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.HOST]: 'Host',
    [ROLES.USER]: 'Attendee'
};

/** Badge class per role, reusing the existing pill palette. */
export const ROLE_BADGE_CLASSES = {
    [ROLES.ADMIN]: 'bd-indigo',
    [ROLES.HOST]: 'bd-green',
    [ROLES.USER]: 'bd-default'
};

/**
 * These must stay byte-identical to AuthModels.PASSWORD_POLICY and
 * AuthModels.EMAIL_POLICY on the backend, otherwise the client will accept
 * passwords the server rejects (or vice versa).
 */
export const REGEX = {
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
};

/** Item-by-item breakdown so the UI can show a live checklist. */
export const PASSWORD_RULES = [
    { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
    { id: 'lower', label: 'One lowercase letter (a-z)', test: (v) => /[a-z]/.test(v) },
    { id: 'upper', label: 'One uppercase letter (A-Z)', test: (v) => /[A-Z]/.test(v) },
    { id: 'number', label: 'One number (0-9)', test: (v) => /\d/.test(v) },
    { id: 'symbol', label: 'One special character (!@#$...)', test: (v) => /[^A-Za-z0-9]/.test(v) }
];

export const PASSWORD_EXAMPLE = 'Event@2026';
