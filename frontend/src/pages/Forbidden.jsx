import { Link } from 'react-router-dom';
import { getUserName, getUserRole } from '../services/authService';
import { ACCESS_DENIED_LABELS, APP_ROUTES, ROLES } from '../constants';

const Forbidden = ({ requiredRoles }) => {
    const userName = getUserName();
    const userRole = getUserRole();

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
                <p className="fd-code">{ACCESS_DENIED_LABELS?.CODE || '403'}</p>
                <h1 className="fd-title">{ACCESS_DENIED_LABELS?.TITLE || 'Access Denied'}</h1>
                <p className="fd-message">
                    {ACCESS_DENIED_LABELS?.MESSAGE || 'You do not have permission to view this page.'}
                </p>

                <dl className="fd-detail">
                    <dt>{ACCESS_DENIED_LABELS?.SIGNED_IN_AS || 'Signed in as'}</dt>
                    <dd>{userName || 'Unknown user'}</dd>

                    <dt>{ACCESS_DENIED_LABELS?.CURRENT_ROLE || 'Your role'}</dt>
                    <dd>
                        <span className={`badge-pill ${currentRoleBadge}`}>
                            {userRole || ACCESS_DENIED_LABELS?.NO_ROLE || 'NONE'}
                        </span>
                    </dd>

                    <dt>{ACCESS_DENIED_LABELS?.REQUIRES_ROLE || 'Required role'}</dt>
                    <dd>
                        <span className="badge-pill bd-indigo">{needed}</span>
                    </dd>
                </dl>

                <p className="fd-contact">
                    {ACCESS_DENIED_LABELS?.CONTACT || 'Switch to an authorized account or return to the dashboard.'}
                </p>

                <div className="fd-actions">
                    <Link to={APP_ROUTES.HOME} className="btn">
                        {ACCESS_DENIED_LABELS?.BACK_HOME || 'Back to Dashboard'}
                    </Link>
                    <Link to={APP_ROUTES.EVENTS} className="btn btn-secondary">
                        {ACCESS_DENIED_LABELS?.BROWSE_EVENTS || 'Browse Events'}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Forbidden;