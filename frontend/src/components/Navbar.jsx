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
        <nav style={{ padding: '15px 30px', backgroundColor: '#282c34', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h2 style={{ margin: '0 30px 0 0', color: '#FFFFFF' }}>Eventora</h2>
                {loggedIn && (
                    <>
                        <Link to="/" style={{ color: '#61dafb', textDecoration: 'none', marginRight: '20px', fontSize: '18px' }}>Dashboard</Link>
                        <Link to="/events" style={{ color: '#61dafb', textDecoration: 'none', marginRight: '20px', fontSize: '18px' }}> Events</Link>

                        {/* Only show My Tickets link for regular attendees */}
                        {userRole === 'USER' && (
                            <Link to="/my-tickets" style={{ color: '#61dafb', textDecoration: 'none', marginRight: '20px', fontSize: '18px' }}> My Tickets</Link>
                        )}

                        {/* Only show the Categories link if the user is an ADMIN */}
                        {userRole === 'ADMIN' && (
                            <Link to="/categories" style={{ color: '#61dafb', textDecoration: 'none', fontSize: '18px' }}> Categories</Link>
                        )}
                    </>
                )}
            </div>

            {/* Right Side: Greeting + Logout Button neatly aligned */}
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