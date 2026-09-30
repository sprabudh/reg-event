import { Link } from 'react-router-dom';
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

    return (
        <nav className="nb-nav">
            <div className="nb-left">
                <h2 className="nb-brand">{NAV_LABELS.BRAND}</h2>
                {loggedIn && (
                    <>
                        <Link to={APP_ROUTES.HOME} className="nb-link nb-spaced">{NAV_LABELS.DASHBOARD}</Link>
                        <Link to={APP_ROUTES.EVENTS} className="nb-link nb-spaced"> {NAV_LABELS.EVENTS}</Link>

                        {/* Only show My Tickets link for regular attendees */}
                        {userRole === ROLES.USER && (
                            <Link to={APP_ROUTES.MY_TICKETS} className="nb-link nb-spaced"> {NAV_LABELS.MY_TICKETS}</Link>
                        )}

                        {/* Only show the Categories link if the user is an ADMIN */}
                        {userRole === ROLES.ADMIN && (
                            <Link to={APP_ROUTES.CATEGORIES} className="nb-link"> {NAV_LABELS.CATEGORIES}</Link>
                        )}
                    </>
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
                    <Link to={APP_ROUTES.LOGIN} className="nb-link">{NAV_LABELS.LOGIN}</Link>
                )}
            </div>
        </nav>
    );
};

export default Header;
