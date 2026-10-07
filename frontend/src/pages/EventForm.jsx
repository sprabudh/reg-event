import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createEvent, getEventById, updateEvent } from '../services/eventService';
import { submitEvent, updateMyEvent, getMyEventById } from '../services/hostService';
import { getUserRole } from '../services/authService';
import { getCategories } from '../services/categoryService';
import Field from '../components/ui/Field';
import { APP_ROUTES, ERROR_MESSAGES, ROLES } from '../constants';
import { getErrorMessage } from '../utils/errors';

const EventForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

    // Same form for admins and hosts. A host's copy is persisted under
    // /api/host/** and lands as PENDING instead of publishing immediately --
    // that difference lives entirely in the service call below.
    const isHost = getUserRole() === ROLES.HOST;
    const backPath = isHost ? APP_ROUTES.HOST_EVENTS : APP_ROUTES.EVENTS;

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
            // A host must read through their own endpoint, otherwise they'd be
            // shown an event the backend will refuse to let them save.
            const load = isHost ? getMyEventById(id) : getEventById(id);

            load
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
    }, [id, isEditMode, isHost]);

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

        const apiCall = isHost
            ? (isEditMode ? updateMyEvent(id, payload) : submitEvent(payload))
            : (isEditMode ? updateEvent(id, payload) : createEvent(payload));

        apiCall
            .then(() => navigate(backPath))
            .catch((err) => setError(getErrorMessage(err, ERROR_MESSAGES.SAVE_EVENT_FAILED(isEditMode ? 'update' : 'create'))));
    };

    return (
        <div className="ef-wrap">
            <div className="ef-card">
                <div className="ef-header">
                    <Link to={backPath} className="ef-back">&larr; Back</Link>
                    <h2 className="ef-title">
                        {isEditMode ? 'Edit Event' : isHost ? 'Request New Event' : 'Create New Event'}
                    </h2>
                </div>

                {/* Approval is the publish step, so a host needs to know their
                    submission is not live yet. Admin sees nothing here. */}
                {isHost && !isEditMode && (
                    <div className="alert-success">
                        Submitted events are reviewed by an admin before they appear in the catalog.
                    </div>
                )}

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

                    <button type="submit" className="ef-btn">
                        {isEditMode ? 'Save Changes' : isHost ? 'Submit for Approval' : 'Create Event'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EventForm;