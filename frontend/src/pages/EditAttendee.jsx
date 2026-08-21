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
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            {/* Standardized Go Back Link */}
            <span
                onClick={() => navigate(-1)}
                style={{ cursor: 'pointer', color: '#64748B', fontWeight: '500', display: 'inline-block', marginBottom: '20px' }}
            >
                ← Go Back
            </span>

            {/* Standardized Card Container */}
            <div className="card">
                <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Attendee</h2>

                {/* Standardized Error Banner */}
                {error && (
                    <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '10px', borderRadius: '4px', marginBottom: '15px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B', display: 'block', marginBottom: '5px' }}>
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748B', display: 'block', marginBottom: '5px' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            style={{ width: '100%', boxSizing: 'border-box' }}
                        />
                    </div>

                    {/* Standardized Button */}
                    <button type="submit" className="btn" style={{ marginTop: '10px' }}>
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditAttendee;