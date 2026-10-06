import { Link } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { registerSchema } from '../utils/validationSchemas';
import useAuthForm from '../hooks/useAuthForm';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
    APP_ROUTES,
    ERROR_MESSAGES,
    FORM_LABELS,
    PASSWORD_EXAMPLE,
    PAGE_LABELS
} from '../constants';

const Register = () => {
    const { field, errors, isSubmitting, apiError, matchState, onSubmit } = useAuthForm({
        schema: registerSchema,
        submit: registerUser,//Api function to call
        errorMessage: ERROR_MESSAGES.REGISTRATION_FAILED,
        buildPayload: ({ name, email, password }) => ({ name, email, password }),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
    });

    return (
        <div className="au-wrap">
            <Card>
                <h1 className="au-brand">{PAGE_LABELS.BRAND}</h1>
                <h2 className="au-sub">{PAGE_LABELS.REGISTER_SUBTITLE}</h2>


                {apiError && <div className="au-error">{apiError}</div>}

                <form onSubmit={onSubmit} className="au-form" noValidate>
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
                        aria-invalid={errors.email ? 'true' : undefined}
                        className={`au-input ${errors.email ? 'input-error' : ''}`}
                        {...field('email')}
                    />
                    {errors.email && (
                        <p className="au-live-feedback feedback-error">{errors.email.message}</p>
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
