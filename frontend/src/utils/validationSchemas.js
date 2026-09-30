import { z } from 'zod';
import { ERROR_MESSAGES, PASSWORD_RULES, REGEX } from '../constants/index.js';

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
 * Login deliberately does NOT apply the password policy. The backend's
 * AuthenticationRequest validates email format but not password strength,
 * and blocking sign-in for a password that predates the current policy
 * would lock those users out with a misleading error.
 */
export const loginSchema = z.object({
    email: emailField(),
    password: z.string().min(1, 'Password is required')
});

const registerShape = {
    name: z.string().min(1, 'Name is required'),
    email: emailField(),
    password: passwordField(),
    confirmPassword: z.string().min(1, 'Please confirm your password')
};

const confirmMatches = {
    message: ERROR_MESSAGES.PASSWORD_MISMATCH,
    path: ['confirmPassword']
};

export const registerSchema = z
    .object(registerShape)
    .refine((values) => values.password === values.confirmPassword, confirmMatches);

export const adminRegisterSchema = registerSchema;
