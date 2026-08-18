import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import EventsList from './pages/EventsList';

function App() {
  return (
      <BrowserRouter>
        <Navbar />
        <div style={{ padding: '20px 40px' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/events" element={<EventsList />} />
          </Routes>
        </div>
      </BrowserRouter>
  );
}

export default App;