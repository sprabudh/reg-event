import ProtectedRoute from './ProtectedRoute';
import Forbidden from '../../pages/Forbidden';
import { getUserRole } from '../../services/authService';

/**
 * Role gate for admin-only pages.
 *
 * Two rules in one place, in this order:
 *   1. Not logged in          -> Login (handled by ProtectedRoute)
 *   2. Logged in, wrong role  -> Forbidden page
 *
 * Without rule 2 a USER could type /create-event into the address bar, fill in
 * the entire admin form, and only discover the problem after submitting -- the
 * backend answers POST /api/events with 403 (SecurityConfig hasAuthority
 * ("ADMIN")) and the page showed "Failed to create event.". The form should
 * never render for someone who cannot use it.
 *
 * This is UX, not security. The role comes from localStorage and can be
 * edited in devtools; the real boundary is still SecurityConfig server-side.
 *
 * `roles` accepts a single role or an array for future multi-role routes:
 *   <RoleRoute roles={ROLES.ADMIN}>...</RoleRoute>
 *   <RoleRoute roles={[ROLES.ADMIN, ROLES.ORGANIZER]}>...</RoleRoute>
 */
const RoleRoute = ({ children, roles }) => {
    const userRole = getUserRole();
    const allowed = Array.isArray(roles) ? roles.includes(userRole) : userRole === roles;

    return (
        <ProtectedRoute>
            {allowed ? children : <Forbidden requiredRoles={roles} />}
        </ProtectedRoute>
    );
};

export default RoleRoute;