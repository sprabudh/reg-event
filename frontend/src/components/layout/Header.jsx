import { NavLink } from 'react-router-dom';
import { getUserName, getUserRole, isAuthenticated, logoutUser } from '../../services/authService';
import { useConfirm } from '../../hooks/useConfirm';
import { APP_ROUTES, CONFIRM_LABELS, NAV_LABELS, PROMPTS, ROLE_BADGE_CLASSES, ROLE_LABELS, ROLES } from '../../constants';

const Header = () => {
    const loggedIn = isAuthenticated();
    const userRole = getUserRole();
    const userName = getUserName();
    const isHost = userRole === ROLES.HOST;
    const confirm = useConfirm();

    const handleLogout = async () => {
        const confirmed = await confirm({
            message: PROMPTS.LOGOUT,
            confirmLabel: CONFIRM_LABELS.LOGOUT
        });
        if (!confirmed) return;

        logoutUser();
        window.location.href = APP_ROUTES.LOGIN;
    };

    const navClass = ({ isActive }) => `nb-link${isActive ? ' active' : ''}`;

    return (
        <nav className="nb-nav">
            <div className="nb-left">
                <h2 className="nb-brand">{NAV_LABELS.BRAND}</h2>
                {loggedIn && (
                    <div className="nb-links">
                        <NavLink to={APP_ROUTES.HOME} end className={navClass}>
                            {NAV_LABELS.DASHBOARD}
                        </NavLink>

                        <NavLink to={APP_ROUTES.EVENTS} className={navClass}>
                            {NAV_LABELS.EVENTS}
                        </NavLink>

                        {/* Show My Tickets link for both regular Attendees and Hosts */}
                        {(userRole === ROLES.USER || isHost) && (
                            <NavLink to={APP_ROUTES.MY_TICKETS} end className={navClass}>
                                {NAV_LABELS.MY_TICKETS}
                            </NavLink>
                        )}

                        {userRole === ROLES.ADMIN && (
                            <NavLink to={APP_ROUTES.CATEGORIES} end className={navClass}>
                                {NAV_LABELS.CATEGORIES}
                            </NavLink>
                        )}

                        {isHost && (
                            <NavLink to={APP_ROUTES.HOST_EVENTS} end className={navClass}>
                                {NAV_LABELS.MY_EVENTS}
                            </NavLink>
                        )}

                        {userRole === ROLES.ADMIN && (
                            <NavLink to={APP_ROUTES.ADMIN_APPROVALS} end className={navClass}>
                                {NAV_LABELS.APPROVALS}
                            </NavLink>
                        )}
                    </div>
                )}
            </div>

            <div className="nb-right">
                {loggedIn ? (
                    <>
                        <span className={`badge-pill nb-role ${ROLE_BADGE_CLASSES[userRole] || 'bd-default'}`}>
                            {ROLE_LABELS[userRole] || 'Attendee'}
                        </span>
                        <span className="nb-greet">
                            {NAV_LABELS.GREETING(userName)}
                        </span>
                        <button onClick={handleLogout} className="nb-logout">
                            {NAV_LABELS.LOGOUT}
                        </button>
                    </>
                ) : (
                    <NavLink to={APP_ROUTES.LOGIN} className={navClass}>
                        {NAV_LABELS.LOGIN}
                    </NavLink>
                )}
            </div>
        </nav>
    );
};

export default Header;