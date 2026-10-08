import { Link } from 'react-router-dom';
import { getUserName, getUserRole } from '../services/authService';
import { ACCESS_DENIED_LABELS, APP_ROUTES, ROLES } from '../constants';

/**
 * Renders either a permission failure or a not-found page.
 *
 * `variant="notFound"` exists because the catch-all route used to reuse this
 * page with requiredRoles=ADMIN, so a mistyped URL told the user the page was
 * "restricted to administrators" -- a 404 mislabelled as a permission error.
 */
const Forbidden = ({ requiredRoles, variant = 'forbidden' }) => {
    const userName = getUserName();
    const userRole = getUserRole();

    const isNotFound = variant === 'notFound';

    const needed = Array.isArray(requiredRoles)
        ? requiredRoles.join(' or ')
        : (requiredRoles || ROLES.ADMIN);

    const currentRoleBadge =
        userRole === ROLES.ADMIN
            ? 'bd-indigo'
            : userRole === ROLES.HOST
                ? 'bd-green'
                : 'bd-orange';

    return (
        <div className="fd-wrap">
            <div className="card fd-card">
                <p className="fd-code">{isNotFound ? ACCESS_DENIED_LABELS.NOT_FOUND_CODE : ACCESS_DENIED_LABELS.CODE}</p>
                <h1 className="fd-title">{isNotFound ? ACCESS_DENIED_LABELS.NOT_FOUND_TITLE : ACCESS_DENIED_LABELS.TITLE}</h1>
                <p className="fd-message">
                    {isNotFound
                        ? ACCESS_DENIED_LABELS.NOT_FOUND_MESSAGE
                        : ACCESS_DENIED_LABELS.MESSAGE_FOR_ROLE(needed)}
                </p>

                {!isNotFound && (
                    <dl className="fd-detail">
                        <dt>{ACCESS_DENIED_LABELS.SIGNED_IN_AS}</dt>
                        <dd>{userName || 'Unknown user'}</dd>

                        <dt>{ACCESS_DENIED_LABELS.CURRENT_ROLE}</dt>
                        <dd>
                            <span className={`badge-pill ${currentRoleBadge}`}>
                                {userRole || ACCESS_DENIED_LABELS.NO_ROLE}
                            </span>
                        </dd>

                        <dt>{ACCESS_DENIED_LABELS.REQUIRES_ROLE}</dt>
                        <dd>
                            <span className="badge-pill bd-indigo">{needed}</span>
                        </dd>
                    </dl>
                )}

                <p className="fd-contact">
                    {isNotFound
                        ? 'Check the address, or head back to a page you know.'
                        : ACCESS_DENIED_LABELS.CONTACT}
                </p>

                <div className="fd-actions">
                    <Link to={APP_ROUTES.HOME} className="btn">
                        {ACCESS_DENIED_LABELS.BACK_HOME}
                    </Link>
                    <Link to={APP_ROUTES.EVENTS} className="btn btn-secondary">
                        {ACCESS_DENIED_LABELS.BROWSE_EVENTS}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Forbidden;