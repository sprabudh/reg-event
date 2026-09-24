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
        <div className="ea-wrap">
            {/* Standardized Go Back Link */}
            <span
                onClick={() => navigate(-1)}
                className="ea-back"
            >
                ← Go Back
            </span>

            {/* Standardized Card Container */}
            <div className="card">
                <h2 className="ea-title">Edit Attendee</h2>

                {/* Standardized Error Banner */}
                {error && (
                    <div className="alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="ea-form">
                    <div>
                        <label className="ea-label">
                            Full Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="ea-input"
                        />
                    </div>
                    <div>
                        <label className="ea-label">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="ea-input"
                        />
                    </div>

                    {/* Standardized Button */}
                    <button type="submit" className="btn ea-submit">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditAttendee;