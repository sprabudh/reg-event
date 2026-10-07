import { z } from 'zod';
import { ACCOUNT_TYPES, HOST_EMAIL_ERROR, HOST_EMAIL_SUFFIX, ERROR_MESSAGES, PASSWORD_RULES, REGEX } from '../constants/index.js';

/** Human-readable list of the rules a password still fails, derived from PASSWORD_RULES. */
const describeMissingPasswordRules = (value) => {
    const missing = PASSWORD_RULES.filter((rule) => !rule.test(value || '')).map((rule) => rule.label);
    return missing.length ? missing.join(', ') : ERROR_MESSAGES.PASSWORD_FORMAT;
};

const emailField = () => z
    .string()
    .min(1, 'Email is required')
    .regex(REGEX.EMAIL, { message: ERROR_MESSAGES.EMAIL_FORMAT });

// superRefine (rather than .regex) so we get the actual value and can report
// exactly which rules are still unmet instead of one generic message.
const passwordField = () => z
    .string()
    .min(1, 'Password is required')
    .superRefine((value, ctx) => {
        // Skip when empty so the user doesn't see two errors on the same field.
        if (value && !REGEX.PASSWORD.test(value)) {
            ctx.addIssue({
                code: 'custom',
                message: describeMissingPasswordRules(value)
            });
        }
    });

/**
 * Login does NOT apply the password policy. The backend's
 * AuthenticationRequest validates email format but not password strength,
 * and blocking sign-in for a password that predates the current policy
 * would lock those users out with a misleading error.
 *
 * accountType is what separates the two doors: a host signing in through the
 * attendee option is rejected server-side, and vice versa. ADMIN is exempt
 * there, so admins can use either option.
 */
export const loginSchema = z.object({
    email: emailField(),
    password: z.string().min(1, 'Password is required'),
    accountType: z.enum([ACCOUNT_TYPES.ATTENDEE, ACCOUNT_TYPES.HOST]).default(ACCOUNT_TYPES.ATTENDEE)
});

const registerShape = {
    name: z.string().min(1, 'Name is required'),
    email: emailField(),
    password: passwordField(),
    confirmPassword: z.string().min(1, 'Please confirm your password'),

    // Attendee or Host. Defaults to ATTENDEE so an untouched form behaves
    // exactly as it did before this option existed.
    accountType: z.enum([ACCOUNT_TYPES.ATTENDEE, ACCOUNT_TYPES.HOST]).default(ACCOUNT_TYPES.ATTENDEE)
};

const confirmMatches = {
    message: ERROR_MESSAGES.PASSWORD_MISMATCH,
    path: ['confirmPassword']
};

export const registerSchema = z
    .object(registerShape)
    .refine((values) => values.password === values.confirmPassword, confirmMatches)
    // Host signups are gated to the platform domain. Checked here as well as
    // in AuthService.assertHostEmail so the user finds out before submitting.
    // Keep HOST_EMAIL_SUFFIX in step with application.security.auth.host-email-domain.
    .superRefine((values, ctx) => {
        if (values.accountType !== ACCOUNT_TYPES.HOST) return;
        if (!values.email || !values.email.toLowerCase().endsWith(HOST_EMAIL_SUFFIX)) {
            ctx.addIssue({
                code: 'custom',
                path: ['email'],
                message: HOST_EMAIL_ERROR
            });
        }
    });

export const adminRegisterSchema = registerSchema;
