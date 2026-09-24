import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createEvent, getEventById, updateEvent } from '../services/eventService';
import { getCategories } from '../services/categoryService';

const EventForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    const [formData, setFormData] = useState({
        name: '',
        date: '',
        time: '',
        duration: '',
        price: '',
        location: '',
        isOnline: false,
        isRefundable: false,
        capacity: '',
        category: { id: '' }
    });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        getCategories()
            .then(res => setCategories(res.data))
            .catch(() => console.error('Failed to load categories'));

        if (isEditMode) {
            getEventById(id)
                .then((res) => {
                    const event = res.data;
                    setFormData({
                        name: event.name || '',
                        date: event.date || '',
                        time: event.time || '',
                        duration: event.duration || '',
                        price: event.price || '',
                        location: event.location || '',
                        isOnline: event.isOnline || false,
                        isRefundable: event.isRefundable || false,
                        capacity: event.capacity || '',
                        category: event.category ? { id: event.category.id } : { id: '' }
                    });
                })
                .catch(() => setError('Failed to load event details.'));
        }
    }, [id, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'category') {
            setFormData({ ...formData, category: { id: value } });
        } else if (type === 'checkbox') {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData, price: formData.price === '' ? 0 : formData.price };

        const apiCall = isEditMode ? updateEvent(id, payload) : createEvent(payload);

        apiCall
            .then(() => navigate('/events'))
            .catch((err) => setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} event.`));
    };

    return (
        <div className="ef-wrap">
            <div className="ef-card">
                <div className="ef-header">
                    <Link to="/events" className="ef-back">← Back to Events</Link>
                    <h2 className="ef-title">{isEditMode ? 'Edit Event' : 'Create New Event'}</h2>
                </div>

                {error && <div className="ef-error">{error}</div>}

                <form onSubmit={handleSubmit} className="ef-form">
                    <div className="ef-group">
                        <label className="ef-label">Event Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="ef-input" required />
                    </div>

                    <div className="ef-group">
                        <label className="ef-label">Event Category</label>
                        <select name="category" value={formData.category.id} onChange={handleChange} className="ef-input" required >
                            <option value="">Select a Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="ef-grid2">
                        <div className="ef-group">
                            <label className="ef-label">Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} className="ef-input" required />
                        </div>
                        <div className="ef-group">
                            <label className="ef-label">Time</label>
                            <input type="time" name="time" value={formData.time} onChange={handleChange} className="ef-input" />
                        </div>
                    </div>

                    <div className="ef-grid2">
                        <div className="ef-group">
                            <label className="ef-label">Duration</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="ef-input" placeholder="e.g., 2 Hours" />
                        </div>
                        <div className="ef-group">
                            <label className="ef-label">Capacity</label>
                            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} className="ef-input" required min="1" />
                        </div>
                    </div>

                    <div className="ef-group">
                        <label className="ef-label">Price (Leave empty or 0 for Free)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} className="ef-input" placeholder="e.g., 50.00" min="0" step="0.01" />
                    </div>

                    <div className="ef-checks-row">
                        <div className="ef-check-item">
                            <input type="checkbox" name="isOnline" checked={formData.isOnline} onChange={handleChange} className="ef-checkbox" />
                            <label className="ef-check-label">Online Event</label>
                        </div>
                        <div className="ef-check-item">
                            <input type="checkbox" name="isRefundable" checked={formData.isRefundable} onChange={handleChange} className="ef-checkbox" />
                            <label className="ef-check-label">Refundable</label>
                        </div>
                    </div>

                    {!formData.isOnline && (
                        <div className="ef-group">
                            <label className="ef-label">Location</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} className="ef-input" placeholder="e.g., Convention Center, Hall A" />
                        </div>
                    )}

                    <button type="submit" className="ef-btn">{isEditMode ? 'Save Changes' : 'Create Event'}</button>
                </form>
            </div>
        </div>
    );
};

export default EventForm;