import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getEventById, updateEvent } from '../services/eventService';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', date: '', capacity: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        getEventById(id)
            .then(res => setFormData(res.data))
            .catch(err => setError("Failed to load event data."));
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateEvent(id, formData)
            .then(() => navigate('/events'))
            .catch(err => setError('Failed to update event. Check your inputs.'));
    };

    return (
        <div>
            <Link to="/events" style={{ textDecoration: 'none', color: '#61dafb' }}>← Back to Events</Link>
            <h2>Edit Event</h2>
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
                <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default EditEvent;