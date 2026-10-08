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
        {/* Skip link: without it, keyboard users tab through the whole nav on
            every page change before reaching the content. */}
        <a href="#main-content" className="lay-skip-link">Skip to main content</a>

        <Header />
        {/* <main> landmark so the routed page is exposed as the document's main
            region rather than an anonymous div. */}
        <main id="main-content" className="app-shell">
            <Outlet />
        </main>
        <Footer />
    </>
);

export default Layout;
