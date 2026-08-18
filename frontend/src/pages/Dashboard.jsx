import { useEffect, useState } from 'react';
import { getEvents } from '../services/eventService';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [totalEvents, setTotalEvents] = useState(0);

    useEffect(() => {
        // We just fetch 1 item because we only care about the totalElements number!
        getEvents(0, 1)
            .then(response => {
                setTotalEvents(response.data.totalElements);
            })
            .catch(error => console.error("Error fetching stats:", error));
    }, []);

    return (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <h1>Welcome to the Event Registration System</h1>
            <p style={{ color: '#555', fontSize: '18px' }}>Manage your corporate events and attendees efficiently.</p>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                <div style={{ padding: '30px', backgroundColor: '#f4f4f9', border: '1px solid #ddd', borderRadius: '10px', minWidth: '250px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>Total Events Hosted</h3>
                    <h1 style={{ fontSize: '60px', margin: '0', color: '#007bff' }}>{totalEvents}</h1>

                    <Link to="/events" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', backgroundColor: '#28a745', color: 'white', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>
                        Manage Events →
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;