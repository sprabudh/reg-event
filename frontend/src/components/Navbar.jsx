import { Link } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav style={{ padding: '15px 30px', backgroundColor: '#282c34', color: 'white', display: 'flex', alignItems: 'center' }}>
            <h2 style={{ margin: '0 30px 0 0' }}>EventReg System</h2>
            <Link to="/" style={{ color: '#61dafb', textDecoration: 'none', marginRight: '20px', fontSize: '18px' }}>Dashboard</Link>
            <Link to="/events" style={{ color: '#61dafb', textDecoration: 'none', fontSize: '18px' }}>Manage Events</Link>
        </nav>
    );
};

export default Navbar;