import { Link } from 'react-router-dom';
import { registerAdmin } from '../services/authService';
import { adminRegisterSchema } from '../utils/validationSchemas';
import useAuthForm from '../hooks/useAuthForm';
import Input from '../components/ui/Input';
import PasswordInput from '../components/ui/PasswordInput';
import Button from '../components/ui/Button';
import {
    APP_ROUTES,
    ERROR_MESSAGES,
    FORM_LABELS,
    PASSWORD_EXAMPLE,
    PAGE_LABELS
} from '../constants';

const AdminRegister = () => {
    const { field, errors, isSubmitting, apiError, matchState, onSubmit } = useAuthForm({
        schema: adminRegisterSchema,
        submit: registerAdmin,
        errorMessage: ERROR_MESSAGES.ADMIN_REGISTRATION_FAILED,
        buildPayload: ({ name, email, password }) => ({ name, email, password }),
        defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
    });

    return (
        <div className="ar-wrap">
            <h2 className="ar-title">{PAGE_LABELS.ADMIN_TITLE}</h2>
            <p className="ar-sub">{PAGE_LABELS.ADMIN_SUBTITLE}</p>

            {apiError && <p className="ar-error">{apiError}</p>}

            <form onSubmit={onSubmit} className="ar-form" noValidate>
                <Input
                    type="text"
                    placeholder={FORM_LABELS.ADMIN_FULL_NAME}
                    aria-invalid={errors.name ? 'true' : undefined}
                    className="ar-input"
                    {...field('name')}
                />
                {errors.name && <p className="ar-error">{errors.name.message}</p>}

                <Input
                    type="email"
                    placeholder={FORM_LABELS.ADMIN_EMAIL}
                    aria-invalid={errors.email ? 'true' : undefined}
                    className="ar-input"
                    {...field('email')}
                />
                {errors.email && <p className="ar-error">{errors.email.message}</p>}

                <PasswordInput
                    variant="ar"
                    placeholder={`${FORM_LABELS.PASSWORD} (e.g., ${PASSWORD_EXAMPLE})`}
                    autoComplete="new-password"
                    error={errors.password?.message}
                    aria-invalid={errors.password ? 'true' : undefined}
                    {...field('password')}
                />

                <PasswordInput
                    variant="ar"
                    placeholder={FORM_LABELS.CONFIRM_PASSWORD}
                    autoComplete="new-password"
                    error={errors.confirmPassword?.message}
                    matchState={matchState}
                    aria-invalid={errors.confirmPassword ? 'true' : undefined}
                    {...field('confirmPassword')}
                />

                <Button type="submit" variant="admin" isLoading={isSubmitting}>
                    {PAGE_LABELS.ADMIN_CTA}
                </Button>
            </form>

            <p className="ar-foot">
                Not an admin? <Link to={APP_ROUTES.REGISTER} className="ar-link">Normal Registration</Link>
            </p>
        </div>
    );
};

export default AdminRegister;
