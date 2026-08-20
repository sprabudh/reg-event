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
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <Link to="/events" style={styles.backLink}>← Back to Events</Link>
                    <h2 style={styles.title}>Edit Event</h2>
                </div>

                {error && <div style={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Event Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="e.g., Annual Tech Conference"
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Date</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Capacity</label>
                        <input
                            type="number"
                            name="capacity"
                            value={formData.capacity}
                            onChange={handleChange}
                            style={styles.input}
                            placeholder="e.g., 100"
                            required min="1"
                        />
                    </div>

                    <button type="submit" style={styles.button}>
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

// Extracted styles object for cleaner JSX
const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        width: '100%',
        maxWidth: '450px',
        border: '1px solid #eaeaea',
    },
    header: {
        marginBottom: '25px',
    },
    backLink: {
        textDecoration: 'none',
        color: '#6366f1',
        fontSize: '14px',
        fontWeight: '500',
        display: 'inline-block',
        marginBottom: '10px',
    },
    title: {
        margin: '0',
        fontSize: '24px',
        color: '#111827',
    },
    errorMessage: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '20px',
        fontSize: '14px',
        border: '1px solid #f87171',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
    },
    input: {
        padding: '12px 15px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        fontSize: '15px',
        color: '#111827',
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    },
    button: {
        marginTop: '10px',
        padding: '14px',
        backgroundColor: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)',
        transition: 'background-color 0.2s',
    }
};

export default EditEvent;