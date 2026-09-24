import { Link } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../services/authService';

const Navbar = () => {
    const loggedIn = isAuthenticated();
    const userRole = getUserRole(); // Fetch the role to check if they are an ADMIN

    // Fetch the stored name from localStorage
    const userName = localStorage.getItem('userName');

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out of Eventora?")) {
            // Your existing logout logic goes here (e.g., clearing local storage, context)
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('email');
            window.location.href = '/login'; // Or navigate('/login')
        }
    };

    return (
        <nav className="nb-nav">
            <div className="nb-left">
                <h2 className="nb-brand">Eventora</h2>
                {loggedIn && (
                    <>
                        <Link to="/" className="nb-link nb-spaced">Dashboard</Link>
                        <Link to="/events" className="nb-link nb-spaced"> Events</Link>

                        {/* Only show My Tickets link for regular attendees */}
                        {userRole === 'USER' && (
                            <Link to="/my-tickets" className="nb-link nb-spaced"> My Tickets</Link>
                        )}

                        {/* Only show the Categories link if the user is an ADMIN */}
                        {userRole === 'ADMIN' && (
                            <Link to="/categories" className="nb-link"> Categories</Link>
                        )}
                    </>
                )}
            </div>

            {/* Right Side: Greeting + Logout Button neatly aligned */}
            <div className="nb-right">
                {loggedIn ? (
                    <>
                        <span className="nb-greet">
                            Hi, {userName || 'User'}!
                        </span>
                        <button onClick={handleLogout} className="nb-logout">
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="nb-link">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;