import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { APP_ROUTES, ROLES } from './constants';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    {/* ---------- Public ---------- */}
                    <Route path={APP_ROUTES.LOGIN} element={<Login />} />
                    <Route path={APP_ROUTES.REGISTER} element={<Register />} />

                    {/* ---------- Auth only ---------- */}
                    <Route path={APP_ROUTES.HOME} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path={APP_ROUTES.EVENTS} element={<ProtectedRoute><EventsList /></ProtectedRoute>} />
                    <Route path={APP_ROUTES.EVENT_DETAIL} element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
                    <Route path={APP_ROUTES.EDIT_ATTENDEE} element={<ProtectedRoute><EditAttendee /></ProtectedRoute>} />

                    {/* ---------- Admin only ---------- */}
                    <Route path={APP_ROUTES.CREATE_EVENT} element={<RoleRoute roles={ROLES.ADMIN}><EventForm /></RoleRoute>} />
                    <Route path={`${APP_ROUTES.CREATE_EVENT}/*`} element={<RoleRoute roles={ROLES.ADMIN}><EventForm /></RoleRoute>} />
                    <Route path={APP_ROUTES.EDIT_EVENT} element={<RoleRoute roles={ROLES.ADMIN}><EventForm /></RoleRoute>} />
                    <Route path="/edit-event/*" element={<RoleRoute roles={ROLES.ADMIN}><EventForm /></RoleRoute>} />
                    <Route path={APP_ROUTES.CATEGORIES} element={<RoleRoute roles={ROLES.ADMIN}><ManageCategories /></RoleRoute>} />
                    <Route path={`${APP_ROUTES.CATEGORIES}/*`} element={<RoleRoute roles={ROLES.ADMIN}><ManageCategories /></RoleRoute>} />
                    <Route path={APP_ROUTES.ADMIN_SETUP} element={<RoleRoute roles={ROLES.ADMIN}><AdminRegister /></RoleRoute>} />
                    <Route path={`${APP_ROUTES.ADMIN_SETUP}/*`} element={<RoleRoute roles={ROLES.ADMIN}><AdminRegister /></RoleRoute>} />
                    <Route path={APP_ROUTES.ADMIN_APPROVALS} element={<RoleRoute roles={ROLES.ADMIN}><AdminApprovals /></RoleRoute>} />
                    <Route path="/admin/*" element={<RoleRoute roles={ROLES.ADMIN}><AdminApprovals /></RoleRoute>} />
                    <Route path="/api/admin/*" element={<RoleRoute roles={ROLES.ADMIN}><AdminApprovals /></RoleRoute>} />

                    {/* ---------- Attendee & Host ----------
                        Unlocks /my-tickets for Hosts who booked other events */}
                    <Route path={APP_ROUTES.MY_TICKETS} element={<RoleRoute roles={[ROLES.USER, ROLES.HOST]}><MyTickets /></RoleRoute>} />
                    <Route path={`${APP_ROUTES.MY_TICKETS}/*`} element={<RoleRoute roles={[ROLES.USER, ROLES.HOST]}><MyTickets /></RoleRoute>} />

                    {/* ---------- Host only ---------- */}
                    <Route path={APP_ROUTES.HOST_EVENTS} element={<RoleRoute roles={ROLES.HOST}><HostEvents /></RoleRoute>} />
                    <Route path={APP_ROUTES.HOST_NEW_EVENT} element={<RoleRoute roles={ROLES.HOST}><EventForm /></RoleRoute>} />
                    <Route path={APP_ROUTES.HOST_EDIT_EVENT} element={<RoleRoute roles={ROLES.HOST}><EventForm /></RoleRoute>} />
                    <Route path={APP_ROUTES.HOST_EVENT_DETAIL} element={<RoleRoute roles={ROLES.HOST}><HostEventDetail /></RoleRoute>} />
                    <Route path="/host/*" element={<RoleRoute roles={ROLES.HOST}><HostEvents /></RoleRoute>} />
                    <Route path="/api/host/*" element={<RoleRoute roles={ROLES.HOST}><HostEvents /></RoleRoute>} />

                    {/* ---------- Terminal States ---------- */}
                    <Route path={APP_ROUTES.FORBIDDEN} element={<ProtectedRoute><Forbidden requiredRoles={ROLES.ADMIN} /></ProtectedRoute>} />
                    <Route path="*" element={<ProtectedRoute><Forbidden requiredRoles={ROLES.ADMIN} /></ProtectedRoute>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;