import { Link } from 'react-router-dom';
import { useWatch } from 'react-hook-form';
import { registerUser } from '../services/authService';
import { registerSchema } from '../utils/validationSchemas';
import useAuthForm from '../hooks/useAuthForm';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    APP_ROUTES,
    ACCOUNT_TYPES,
    ERROR_MESSAGES,
    FORM_LABELS,
    HOST_EMAIL_ERROR,
    HOST_EMAIL_OK,
    HOST_EMAIL_SUFFIX,
    PASSWORD_EXAMPLE,
    PAGE_LABELS
} from '../constants';

const Register = () => {
    const { field, errors, isSubmitting, apiError, matchState, control, onSubmit } = useAuthForm({
        schema: registerSchema,
        submit: registerUser,
        errorMessage: ERROR_MESSAGES.REGISTRATION_FAILED,
        buildPayload: ({ name, email, password, accountType }) => ({ name, email, password, accountType }),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            accountType: ACCOUNT_TYPES.ATTENDEE
        }
    });

    const accountType = useWatch({ control, name: 'accountType' });
    const email = useWatch({ control, name: 'email' });

    const isHost = accountType === ACCOUNT_TYPES.HOST;
    const trimmedEmail = (email || '').trim();

    const emailTyped = trimmedEmail.length > 0;
    const hostEmailOk = trimmedEmail.toLowerCase().endsWith(HOST_EMAIL_SUFFIX);
    const showHostEmailError = isHost && emailTyped && !hostEmailOk;
    const showHostEmailOk = isHost && emailTyped && hostEmailOk;

    return (
        <div className="au-wrap">
            <Card>
                <h1 className="au-brand">{PAGE_LABELS.BRAND}</h1>
                <h2 className="au-sub">{PAGE_LABELS.REGISTER_SUBTITLE}</h2>

                {apiError && <div className="au-error">{apiError}</div>}

                <form onSubmit={onSubmit} className="au-form" noValidate>
                    <div className="au-type-row">
                        <label className="au-type-option">
                            <input
                                type="radio"
                                value={ACCOUNT_TYPES.ATTENDEE}
                                {...field('accountType')}
                            />
                            <span>Attendee </span>
                        </label>
                        <label className="au-type-option">
                            <input
                                type="radio"
                                value={ACCOUNT_TYPES.HOST}
                                {...field('accountType')}
                            />
                            <span>Host </span>
                        </label>
                    </div>
                    {errors.accountType && (
                        <p className="au-live-feedback feedback-error">{errors.accountType.message}</p>
                    )}

                    <Input
                        type="text"
                        placeholder={FORM_LABELS.FULL_NAME}
                        aria-invalid={errors.name ? 'true' : undefined}
                        className={`au-input ${errors.name ? 'input-error' : ''}`}
                        {...field('name')}
                    />
                    {errors.name && (
                        <p className="au-live-feedback feedback-error">{errors.name.message}</p>
                    )}

                    <Input
                        type="email"
                        placeholder={FORM_LABELS.EMAIL}
                        aria-invalid={errors.email || showHostEmailError ? 'true' : undefined}
                        className={`au-input ${errors.email || showHostEmailError ? 'input-error' : ''}`}
                        {...field('email')}
                    />

                    {/* FIX: Only show Zod's email error if we aren't already showing the manual live Host error */}
                    {errors.email && !showHostEmailError && (
                        <p className="au-live-feedback feedback-error">{errors.email.message}</p>
                    )}
                    {showHostEmailError && (
                        <p className="au-live-feedback feedback-error" role="alert">
                            {HOST_EMAIL_ERROR}
                        </p>
                    )}
                    {showHostEmailOk && (
                        <p className="au-live-feedback au-host-email-ok" role="status">
                            {HOST_EMAIL_OK}
                        </p>
                    )}

                    <PasswordInput
                        placeholder={`${FORM_LABELS.PASSWORD} (e.g., ${PASSWORD_EXAMPLE})`}
                        autoComplete="new-password"
                        error={errors.password?.message}
                        aria-invalid={errors.password ? 'true' : undefined}
                        className={errors.password ? 'input-error' : ''}
                        {...field('password')}
                    />

                    <PasswordInput
                        placeholder={FORM_LABELS.CONFIRM_PASSWORD}
                        autoComplete="new-password"
                        error={errors.confirmPassword?.message}
                        matchState={matchState}
                        aria-invalid={errors.confirmPassword ? 'true' : undefined}
                        className={errors.confirmPassword ? 'input-error' : ''}
                        {...field('confirmPassword')}
                    />

                    <Button type="submit" variant="auth" isLoading={isSubmitting}>
                        {PAGE_LABELS.REGISTER_CTA}
                    </Button>
                </form>

                <p className="au-linktext">
                    Already have an account?{' '}
                    <Link to={APP_ROUTES.LOGIN} className="au-link">Login here</Link>
                </p>
            </Card>
        </div>
    );
};

export default Register;