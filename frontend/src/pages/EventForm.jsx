import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createEvent, getEventById, updateEvent } from '../services/eventService';
import { getCategories } from '../services/categoryService';
import Field from '../components/ui/Field';
import { APP_ROUTES, ERROR_MESSAGES } from '../constants';
import { getErrorMessage } from '../utils/errors';

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
                .catch(() => setError(ERROR_MESSAGES.LOAD_EVENT_DETAILS_FAILED));
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
            .then(() => navigate(APP_ROUTES.EVENTS))
            .catch((err) => setError(getErrorMessage(err, ERROR_MESSAGES.SAVE_EVENT_FAILED(isEditMode ? 'update' : 'create'))));
    };

    return (
        <div className="ef-wrap">
            <div className="ef-card">
                <div className="ef-header">
                    <Link to={APP_ROUTES.EVENTS} className="ef-back">← Back to Events</Link>
                    <h2 className="ef-title">{isEditMode ? 'Edit Event' : 'Create New Event'}</h2>
                </div>

                {error && <div className="ef-error">{error}</div>}

                <form onSubmit={handleSubmit} className="ef-form">
                    <Field label="Event Name" name="name" value={formData.name} onChange={handleChange} required />

                    <Field label="Event Category" name="category" value={formData.category.id} onChange={handleChange} required>
                        <select name="category" value={formData.category.id} onChange={handleChange} className="ef-input" required>
                            <option value="">Select a Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </Field>

                    <div className="ef-grid2">
                        <Field label="Date" name="date" type="date" value={formData.date} onChange={handleChange} required />
                        <Field label="Time" name="time" type="time" value={formData.time} onChange={handleChange} />
                    </div>

                    <div className="ef-grid2">
                        <Field label="Duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 2 Hours" />
                        <Field label="Capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} required min="1" />
                    </div>

                    <Field label="Price (Leave empty or 0 for Free)" name="price" type="number" value={formData.price} onChange={handleChange} placeholder="e.g., 50.00" min="0" step="0.01" />

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
                        <Field label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g., Convention Center, Hall A" />
                    )}

                    <button type="submit" className="ef-btn">{isEditMode ? 'Save Changes' : 'Create Event'}</button>
                </form>
            </div>
        </div>
    );
};

export default EventForm;