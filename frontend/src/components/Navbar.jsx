import { Link } from 'react-router-dom';
import { isAuthenticated, logoutUser } from '../services/authService';

const Navbar = () => {
    const loggedIn = isAuthenticated();

    // Fetch the stored name from localStorage
    const userName = localStorage.getItem('userName');

    const handleLogout = () => {
        logoutUser();
        localStorage.removeItem('userName'); // Clear the name on logout
        window.location.href = '/login';
    };

    return (
        <nav style={{ padding: '15px 30px', backgroundColor: '#282c34', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h2 style={{ margin: '0 30px 0 0', color: '#FFFFFF' }}>Eventora</h2>
                {loggedIn && (
                    <>
                        <Link to="/" style={{ color: '#61dafb', textDecoration: 'none', marginRight: '20px', fontSize: '18px' }}>Dashboard</Link>
                        <Link to="/events" style={{ color: '#61dafb', textDecoration: 'none', fontSize: '18px' }}>Manage Events</Link>
                    </>
                )}
            </div>

            {/* Updated Right Side: Greeting + Logout Button neatly aligned */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {loggedIn ? (
                    <>
                        <span style={{ fontSize: '16px', color: '#e0e0e0', fontWeight: '500' }}>
                            Hi, {userName || 'User'}!
                        </span>
                        <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" style={{ color: '#61dafb', textDecoration: 'none', fontSize: '18px' }}>Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;