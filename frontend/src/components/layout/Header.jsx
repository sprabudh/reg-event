import { NavLink } from 'react-router-dom';
import { getUserName, getUserRole, isAuthenticated, logoutUser } from '../../services/authService';
import { APP_ROUTES, NAV_LABELS, PROMPTS, ROLES } from '../../constants';

const Header = () => {
    const loggedIn = isAuthenticated();
    const userRole = getUserRole();
    const userName = getUserName();

    const handleLogout = () => {
        if (window.confirm(PROMPTS.LOGOUT)) {
            // Full page reload is deliberate: the header reads localStorage
            // during render, so a client-side navigate would leave a stale header.
            logoutUser();
            window.location.href = APP_ROUTES.LOGIN;
        }
    };

    /**
     * NavLink works out whether its target is the current page and calls this
     * with that answer, so the active styling lives in one place instead of
     * being tracked by hand on every link.
     */
    const navClass = ({ isActive }) => `nb-link${isActive ? ' active' : ''}`;

    return (
        <nav className="nb-nav">
            <div className="nb-left">
                <h2 className="nb-brand">{NAV_LABELS.BRAND}</h2>
                {loggedIn && (
                    <div className="nb-links">
                        {/* `end` matters on "/": react-router treats a bare "/"
                            target as matching every path, so without it the
                            Dashboard pill would stay lit on all pages. */}
                        <NavLink to={APP_ROUTES.HOME} end className={navClass}>
                            {NAV_LABELS.DASHBOARD}
                        </NavLink>

                        {/* Deliberately no `end` here: /events/:id is a
                            drill-down of the catalog, so Events stays lit. */}
                        <NavLink to={APP_ROUTES.EVENTS} className={navClass}>
                            {NAV_LABELS.EVENTS}
                        </NavLink>

                        {/* Only show My Tickets link for regular attendees */}
                        {userRole === ROLES.USER && (
                            <NavLink to={APP_ROUTES.MY_TICKETS} end className={navClass}>
                                {NAV_LABELS.MY_TICKETS}
                            </NavLink>
                        )}

                        {/* Only show the Categories link if the user is an ADMIN */}
                        {userRole === ROLES.ADMIN && (
                            <NavLink to={APP_ROUTES.CATEGORIES} end className={navClass}>
                                {NAV_LABELS.CATEGORIES}
                            </NavLink>
                        )}
                    </div>
                )}
            </div>

            {/* Right Side: Greeting + Logout Button neatly aligned */}
            <div className="nb-right">
                {loggedIn ? (
                    <>
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
