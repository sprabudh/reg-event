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
        defaultValues: { email: '', password: '' }
    });

    return (
        <div className="au-wrap">
            <Card>
                <h1 className="au-brand">{PAGE_LABELS.BRAND}</h1>
                <h2 className="au-sub">{PAGE_LABELS.LOGIN_SUBTITLE}</h2>

                {apiError && <div className="au-error">{apiError}</div>}

                <form onSubmit={onSubmit} className="au-form" noValidate>
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
