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
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <Link to="/events" style={styles.backLink}>← Back to Events</Link>
                    <h2 style={styles.title}>{isEditMode ? 'Edit Event' : 'Create New Event'}</h2>
                </div>

                {error && <div style={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Event Name</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} required />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Event Category</label>
                        <select name="category" value={formData.category.id} onChange={handleChange} style={styles.input} required >
                            <option value="">Select a Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} style={styles.input} required />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Time</label>
                            <input type="time" name="time" value={formData.time} onChange={handleChange} style={styles.input} />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Duration</label>
                            <input type="text" name="duration" value={formData.duration} onChange={handleChange} style={styles.input} placeholder="e.g., 2 Hours" />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Capacity</label>
                            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} style={styles.input} required min="1" />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Price (Leave empty or 0 for Free)</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} style={styles.input} placeholder="e.g., 50.00" min="0" step="0.01" />
                    </div>

                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" name="isOnline" checked={formData.isOnline} onChange={handleChange} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                            <label style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Online Event</label>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" name="isRefundable" checked={formData.isRefundable} onChange={handleChange} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                            <label style={{ fontSize: '14px', fontWeight: '500', cursor: 'pointer' }}>Refundable</label>
                        </div>
                    </div>

                    {!formData.isOnline && (
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Location</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} style={styles.input} placeholder="e.g., Convention Center, Hall A" />
                        </div>
                    )}

                    <button type="submit" style={styles.button}>{isEditMode ? 'Save Changes' : 'Create Event'}</button>
                </form>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: { display: 'flex', justifyContent: 'center', padding: '40px 20px', fontFamily: 'system-ui, -apple-system, sans-serif' },
    card: { backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)', width: '100%', maxWidth: '550px', border: '1px solid #eaeaea' },
    header: { marginBottom: '25px' },
    backLink: { textDecoration: 'none', color: '#6366f1', fontSize: '14px', fontWeight: '500', display: 'inline-block', marginBottom: '10px' },
    title: { margin: '0', fontSize: '24px', color: '#111827' },
    errorMessage: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', border: '1px solid #f87171' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
    label: { fontSize: '14px', fontWeight: '600', color: '#374151' },
    input: { padding: '12px 15px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', color: '#111827', outline: 'none', boxSizing: 'border-box' },
    button: { marginTop: '10px', padding: '14px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)' }
};

export default EventForm;