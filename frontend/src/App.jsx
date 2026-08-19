import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import EventsList from './pages/EventsList';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import EditEvent from './pages/EditEvent';
import EditAttendee from './pages/EditAttendee';
import Login from './pages/Login';
import Register from './pages/Register';
import { isAuthenticated } from './services/authService';

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
            <div style={{ padding: '20px 40px' }}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes */}
                    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/events" element={<ProtectedRoute><EventsList /></ProtectedRoute>} />
                    <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
                    <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
                    <Route path="/edit-event/:id" element={<ProtectedRoute><EditEvent /></ProtectedRoute>} />
                    <Route path="/edit-attendee/:id" element={<ProtectedRoute><EditAttendee /></ProtectedRoute>} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;