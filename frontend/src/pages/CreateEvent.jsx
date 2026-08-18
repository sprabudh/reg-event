import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../services/eventService';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        capacity: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Call our Java API through Axios
        createEvent(formData)
            .then(() => {
                // If successful, go back to the events page
                navigate('/events');
            })
            .catch((err) => {
                console.error(err);
                setError('Failed to create event. Please check your inputs.');
            });
    };

    return (
        <div>
            <h2>Create New Event</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '15px' }}>
                <div>
                    <label>Event Name:</label><br/>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label>Date:</label><br/>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                </div>
                <div>
                    <label>Capacity:</label><br/>
                    <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required min="1" />
                </div>
                <button type="submit" style={{ padding: '10px', backgroundColor: '#61dafb', border: 'none', cursor: 'pointer' }}>
                    Create Event
                </button>
            </form>
        </div>
    );
};

export default CreateEvent;