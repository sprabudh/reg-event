import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createEvent, getEventById, updateEvent } from '../services/eventService';
import { submitEvent, updateMyEvent, getMyEventById } from '../services/hostService';
import { getUserRole } from '../services/authService';
import { getCategories } from '../services/categoryService';
import Field from '../components/ui/Field';
import { APP_ROUTES, ERROR_MESSAGES, ROLES } from '../constants';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

const EventForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = Boolean(id);

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
    const [fieldErrors, setFieldErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    // Edit mode: null until the event has loaded. A failed load left an empty but
    // fully submittable form, so saving would overwrite the event with blanks.
    const [loadedId, setLoadedId] = useState(null);

    useEffect(() => {
        getCategories()
            .then(res => setCategories(res.data || []))
            // Swallowed to console only, which left a required dropdown empty and
            // unsatisfiable with no explanation.
            .catch(() => setError(ERROR_MESSAGES.LOAD_CATEGORIES_FAILED));

        if (isEditMode) {
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
                .catch(() => setError(ERROR_MESSAGES.LOAD_EVENT_DETAILS_FAILED))
                .finally(() => setLoadedId(id));
        }
    }, [id, isEditMode, isHost]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (fieldErrors[name] || fieldErrors['category.id']) {
            setFieldErrors({ ...fieldErrors, [name]: undefined, 'category.id': undefined });
        }

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
        if (isSaving) return;
        // Block saving until the event has loaded, otherwise an edit that raced
        // the fetch would PUT an empty payload over the existing record.
        if (isEditMode && loadedId !== id) return;
        setError('');
        setFieldErrors({});

        const payload = {
            ...formData,
            price: formData.price === '' ? 0 : formData.price,
            category: formData.category.id ? { id: formData.category.id } : null
        };

        const apiCall = isHost
            ? (isEditMode ? updateMyEvent(id, payload) : submitEvent(payload))
            : (isEditMode ? updateEvent(id, payload) : createEvent(payload));

        setIsSaving(true);
        apiCall
            .then(() => navigate(backPath))
            .catch((err) => {
                const extractedFieldErrors = getFieldErrors(err);

                if (Object.keys(extractedFieldErrors).length > 0) {
                    setFieldErrors(extractedFieldErrors);
                    setError('Please fix the errors below.');
                } else {
                    setError(getErrorMessage(err, ERROR_MESSAGES.SAVE_EVENT_FAILED(isEditMode ? 'update' : 'create')));
                }
                setIsSaving(false);
            });
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

                {isHost && !isEditMode && (
                    <div className="alert-success">
                        Submitted events are reviewed by an admin before they appear in the catalog.
                    </div>
                )}

                {error && <div className="ef-error" role="alert">{error}</div>}

                <form onSubmit={handleSubmit} className="ef-form" noValidate>

                    <Field label="Event Name" name="name" value={formData.name} onChange={handleChange} error={fieldErrors.name} required />

                    <Field label="Event Category" name="category" id="ef-category" value={formData.category.id} onChange={handleChange} error={fieldErrors['category.id'] || fieldErrors.category} required>
                        <select
                            name="category"
                            id="ef-category"
                            value={formData.category.id}
                            onChange={handleChange}
                            className="ef-input"
                            required
                            aria-invalid={fieldErrors['category.id'] || fieldErrors.category ? true : undefined}
                        >
                            <option value="">Select a Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </Field>

                    <div className="ef-grid2">
                        <Field label="Date" name="date" type="date" value={formData.date} onChange={handleChange} error={fieldErrors.date} required />
                        <Field label="Time" name="time" type="time" value={formData.time} onChange={handleChange} error={fieldErrors.time} required />
                    </div>

                    <div className="ef-grid2">
                        <Field label="Duration" name="duration" value={formData.duration} onChange={handleChange} error={fieldErrors.duration} placeholder="e.g., 2 Hours" required />
                        <Field label="Capacity" name="capacity" type="number" value={formData.capacity} onChange={handleChange} error={fieldErrors.capacity} required min="1" />
                    </div>

                    <Field label="Price (Enter 0 for Free)" name="price" type="number" value={formData.price} onChange={handleChange} error={fieldErrors.price} placeholder="e.g., 50.00" min="0" step="0.01" required />

                    <div className="ef-checks-row">
                        {/* The label sat beside the checkbox rather than wrapping
                            it, so clicking the text did not toggle the control. */}
                        <div className="ef-check-item">
                            <input type="checkbox" id="ef-is-online" name="isOnline" checked={formData.isOnline} onChange={handleChange} className="ef-checkbox" />
                            <label htmlFor="ef-is-online" className="ef-check-label">Online Event</label>
                        </div>
                        <div className="ef-check-item">
                            <input type="checkbox" id="ef-is-refundable" name="isRefundable" checked={formData.isRefundable} onChange={handleChange} className="ef-checkbox" />
                            <label htmlFor="ef-is-refundable" className="ef-check-label">Refundable</label>
                        </div>
                    </div>

                    {!formData.isOnline && (
                        <Field label="Location" name="location" value={formData.location} onChange={handleChange} error={fieldErrors.location} placeholder="e.g., Convention Center, Hall A" />
                    )}

                    <button type="submit" className="ef-btn" disabled={isSaving}>
                        {isSaving
                            ? 'Saving...'
                            : isEditMode ? 'Save Changes' : isHost ? 'Submit for Approval' : 'Create Event'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EventForm;