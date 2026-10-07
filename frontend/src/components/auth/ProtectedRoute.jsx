import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../services/authService';
import { APP_ROUTES } from '../../constants';

/**
 * Auth-only guard: keeps anonymous visitors out and sends them to Login.
 *
 * Lifted out of App.jsx so RoleRoute can wrap it -- every role-gated route
 * needs the auth check to run first, otherwise an anonymous visitor would be
 * told "admin only" instead of being asked to log in.
 *
 * Note this reads localStorage during render, same as Header does. That is
 * consistent with the app's full-page-navigation approach (see
 * utils/navigation.js): login and logout both reload the page, so the stored
 * role is always fresh by the time this renders.
 */
const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to={APP_ROUTES.LOGIN} replace />;
    }

    return children;
};

export default ProtectedRoute;