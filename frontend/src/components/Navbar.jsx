import { Link } from 'react-router-dom';
import { isAuthenticated, logoutUser } from '../services/authService';

const Navbar = () => {
    const loggedIn = isAuthenticated();

    const handleLogout = () => {
        logoutUser();
        window.location.href = '/login';
    };

    return (
        <nav style={{ padding: '15px 30px', backgroundColor: '#282c34', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <h2 style={{ margin: '0 30px 0 0' }}>EventReg System</h2>
                {loggedIn && (
                    <>
                        <Link to="/" style={{ color: '#61dafb', textDecoration: 'none', marginRight: '20px', fontSize: '18px' }}>Dashboard</Link>
                        <Link to="/events" style={{ color: '#61dafb', textDecoration: 'none', fontSize: '18px' }}>Manage Events</Link>
                    </>
                )}
            </div>

            <div>
                {loggedIn ? (
                    <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
                ) : (
                    <Link to="/login" style={{ color: '#61dafb', textDecoration: 'none', fontSize: '18px' }}>Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;