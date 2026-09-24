import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
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

// This acts as a guard. If there is no token, it kicks them to the login screen!
const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }
    return children;
};

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <div className="app-shell">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes */}
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/events" element={<ProtectedRoute><EventsList /></ProtectedRoute>} />
                    <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
                    <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />

                    {/* UPDATED: Both routes now use the shared EventForm component */}
                    <Route path="/create-event" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />
                    <Route path="/edit-event/:id" element={<ProtectedRoute><EventForm /></ProtectedRoute>} />

                    <Route path="/edit-attendee/:id" element={<ProtectedRoute><EditAttendee /></ProtectedRoute>} />
                    <Route path="/admin-setup" element={<AdminRegister />} />

                    <Route path="/categories" element={<ManageCategories />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;