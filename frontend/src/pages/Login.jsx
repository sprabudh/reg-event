import { Link } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { loginSchema } from '../utils/validationSchemas';
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
    PAGE_LABELS
} from '../constants';

const Login = () => {
    const { field, errors, isSubmitting, apiError, onSubmit } = useAuthForm({
        schema: loginSchema,
        submit: loginUser,
        errorMessage: ERROR_MESSAGES.AUTH_FAILED,
        // Login shows no inline errors until you hit submit, matching the
        // original behaviour.
        mode: 'onSubmit',
        buildPayload: ({ email, password, accountType }) => ({ email, password, accountType }),
        defaultValues: { email: '', password: '', accountType: ACCOUNT_TYPES.ATTENDEE }
    });

    return (
        <div className="au-wrap">
            <Card>
                <h1 className="au-brand">{PAGE_LABELS.BRAND}</h1>
                <h2 className="au-sub">{PAGE_LABELS.LOGIN_SUBTITLE}</h2>

                {apiError && <div className="au-error">{apiError}</div>}

                <form onSubmit={onSubmit} className="au-form" noValidate>
                    {/* Which door you're coming through. The backend rejects a
                        mismatch, so a host cannot sign in as an attendee or the
                        reverse. Admin is exempt and may use either. */}
                    <div className="au-type-row">
                        <label className="au-type-option">
                            <input
                                type="radio"
                                value={ACCOUNT_TYPES.ATTENDEE}
                                {...field('accountType')}
                            />
                            <span>Attendee</span>
                        </label>
                        <label className="au-type-option">
                            <input
                                type="radio"
                                value={ACCOUNT_TYPES.HOST}
                                {...field('accountType')}
                            />
                            <span>Host</span>
                        </label>
                    </div>

                    <Input
                        type="email"
                        placeholder={FORM_LABELS.EMAIL}
                        aria-invalid={errors.email ? 'true' : undefined}
                        className={`au-input ${errors.email ? 'input-error' : ''}`}
                        {...field('email')}
                    />
                    {errors.email && (
                        <p className="au-live-feedback feedback-error">{errors.email.message}</p>
                    )}

                    <PasswordInput
                        placeholder={FORM_LABELS.PASSWORD}
                        autoComplete="current-password"
                        error={errors.password?.message}
                        aria-invalid={errors.password ? 'true' : undefined}
                        {...field('password')}
                    />

                    <Button type="submit" variant="auth" isLoading={isSubmitting}>
                        {PAGE_LABELS.LOGIN_CTA}
                    </Button>
                </form>

                <p className="au-linktext">
                    Don't have an account?{' '}
                    <Link to={APP_ROUTES.REGISTER} className="au-link">Register here</Link>
                </p>
            </Card>
        </div>
    );
};

export default Login;
