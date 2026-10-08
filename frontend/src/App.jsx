import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import Dashboard from './pages/Dashboard';
import EventsList from './pages/EventsList';
import EventDetails from './pages/EventDetails';
import EventForm from './pages/EventForm';
import EditAttendee from './pages/EditAttendee';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import ManageCategories from './pages/ManageCategories';
import MyTickets from './pages/MyTickets';
import HostEvents from './pages/HostEvents';
import HostEventDetail from './pages/HostEventDetail';
import AdminApprovals from './pages/AdminApprovals';
import Forbidden from './pages/Forbidden';
import { isAuthenticated } from './services/authService';
import { APP_ROUTES, ROLES } from './constants';

/**
 * Inverse of ProtectedRoute: keeps an already-signed-in user off the login and
 * registration pages. Only a UX guard -- the real boundary is the backend.
 */
function PublicOnlyRoute({ children }) {
    return isAuthenticated() ? <Navigate to={APP_ROUTES.HOME} replace /> : children;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    {/* ---------- Public ---------- */}
                    {/* Signed-in users landing on /login or /register were shown
                        the form again; send them to their dashboard instead. */}
                    <Route path={APP_ROUTES.LOGIN} element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                    <Route path={APP_ROUTES.REGISTER} element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />

                    {/* ---------- Auth only ---------- */}
                    <Route path={APP_ROUTES.HOME} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path={APP_ROUTES.EVENTS} element={<ProtectedRoute><EventsList /></ProtectedRoute>} />
                    <Route path={APP_ROUTES.EVENT_DETAIL} element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
                    <Route path={APP_ROUTES.EDIT_ATTENDEE} element={<ProtectedRoute><EditAttendee /></ProtectedRoute>} />

                    {/* ---------- Admin only ---------- */}
                    <Route path={APP_ROUTES.CREATE_EVENT} element={<RoleRoute roles={ROLES.ADMIN}><EventForm /></RoleRoute>} />
                    <Route path={APP_ROUTES.EDIT_EVENT} element={<RoleRoute roles={ROLES.ADMIN}><EventForm /></RoleRoute>} />
                    <Route path={APP_ROUTES.CATEGORIES} element={<RoleRoute roles={ROLES.ADMIN}><ManageCategories /></RoleRoute>} />
                    <Route path={APP_ROUTES.ADMIN_SETUP} element={<RoleRoute roles={ROLES.ADMIN}><AdminRegister /></RoleRoute>} />
                    <Route path={APP_ROUTES.ADMIN_APPROVALS} element={<RoleRoute roles={ROLES.ADMIN}><AdminApprovals /></RoleRoute>} />

                    {/* ---------- Attendee & Host ----------
                        Unlocks /my-tickets for Hosts who booked other events */}
                    <Route path={APP_ROUTES.MY_TICKETS} element={<RoleRoute roles={[ROLES.USER, ROLES.HOST]}><MyTickets /></RoleRoute>} />

                    {/* ---------- Host only ---------- */}
                    <Route path={APP_ROUTES.HOST_EVENTS} element={<RoleRoute roles={ROLES.HOST}><HostEvents /></RoleRoute>} />
                    <Route path={APP_ROUTES.HOST_NEW_EVENT} element={<RoleRoute roles={ROLES.HOST}><EventForm /></RoleRoute>} />
                    <Route path={APP_ROUTES.HOST_EDIT_EVENT} element={<RoleRoute roles={ROLES.HOST}><EventForm /></RoleRoute>} />
                    <Route path={APP_ROUTES.HOST_EVENT_DETAIL} element={<RoleRoute roles={ROLES.HOST}><HostEventDetail /></RoleRoute>} />

                    {/* ---------- Terminal States ---------- */}
                    {/* The catch-all is a 404, not a permission failure: it used
                        to render Forbidden with requiredRoles=ADMIN, telling any
                        user who mistyped a URL that the page was admin-only. */}
                    <Route path="*" element={<ProtectedRoute><Forbidden variant="notFound" /></ProtectedRoute>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;