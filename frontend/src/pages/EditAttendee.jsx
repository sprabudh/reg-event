import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAttendeeById, updateAttendee } from '../services/attendeeService';

const EditAttendee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        getAttendeeById(id)
            .then(res => setFormData(res.data))
            .catch(err => setError("Failed to load attendee data."));
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateAttendee(id, formData)
            .then(() => {
                navigate(-1); // Automatically goes back to the Event Details page!
            })
            .catch((err) => {
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Failed to update attendee. Check your inputs.');
                }
            });
    };

    return (
        <div>
            <button onClick={() => navigate(-1)} style={{ padding: '5px 10px', backgroundColor: '#ccc', border: 'none', cursor: 'pointer', marginBottom: '20px' }}>
                ← Go Back
            </button>
            <h2>Edit Attendee</h2>
            {error && <div style={{ color: 'white', backgroundColor: '#ff4d4d', padding: '10px', marginBottom: '15px', borderRadius: '4px' }}>⚠️ {error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', maxWidth: '300px', gap: '15px' }}>
                <div>
                    <label>Full Name:</label><br/>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <div>
                    <label>Email Address:</label><br/>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '8px' }} />
                </div>
                <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default EditAttendee;