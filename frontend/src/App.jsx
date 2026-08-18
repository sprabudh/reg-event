import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import EventsList from './pages/EventsList';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import EditEvent from './pages/EditEvent';
import EditAttendee from './pages/EditAttendee';

function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <div style={{ padding: '20px 40px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<EventsList />} />
            <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/edit-event/:id" element={<EditEvent />} />
              <Route path="/edit-attendee/:id" element={<EditAttendee />} />
          </Routes>
        </div>
      </BrowserRouter>
  );
}

export default App;