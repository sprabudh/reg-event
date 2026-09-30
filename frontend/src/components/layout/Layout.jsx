import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

/**
 * App shell. Renders the header, the routed page, and the footer on every
 * route. Matches the previous structure: the header already rendered on all
 * pages, so wrapping the routes here changes nothing visually apart from
 * the new footer.
 */
const Layout = () => (
    <>
        <Header />
        <div className="app-shell">
            <Outlet />
        </div>
        <Footer />
    </>
);

export default Layout;
