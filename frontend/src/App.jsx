import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import EventsList from './pages/EventsList';
import EventDetails from './pages/EventDetails';
import EventForm from './pages/EventForm';
import EditAttendee from './pages/EditAttendee';
import Login from './pages/Login';
import Register from './pages/Register';
import { isAuthenticated } from './services/authService';
import AdminRegister from './pages/AdminRegister';
import ManageCategories from "./pages/ManageCategories.jsx";
import MyTickets from './pages/MyTickets';
import { APP_ROUTES } from './constants';

// This acts as a guard. If there is no token, it kicks them to the login screen!
const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to={APP_ROUTES.LOGIN} replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    {/* Public Routes */}
                    <Route path={APP_ROUTES.LOGIN} element={<Login />} />
                    <Route path={APP_ROUTES.REGISTER} element={<Register />} />

                    {/* Protected Routes */}
                    <Route path={APP_ROUTES.HOME} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path={APP_ROUTES.EVENTS} element={<ProtectedRoute><EventsList /></ProtectedRoute>} />
                    <Route path={APP_ROUTES.EVENT_DETAIL} element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
                    <Route path={APP_ROUTES.MY_TICKETS} element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />

                    <Route path={APP_ROUTES.CREATE_EVENT} element={<ProtectedRoute><EventForm /></ProtectedRoute>} />
                    <Route path={APP_ROUTES.EDIT_EVENT} element={<ProtectedRoute><EventForm /></ProtectedRoute>} />

                    <Route path={APP_ROUTES.EDIT_ATTENDEE} element={<ProtectedRoute><EditAttendee /></ProtectedRoute>} />
                    <Route path={APP_ROUTES.ADMIN_SETUP} element={<AdminRegister />} />

                    <Route path={APP_ROUTES.CATEGORIES} element={<ManageCategories />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
