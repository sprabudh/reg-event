import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAttendeeById, updateAttendee } from '../services/attendeeService';
import { getUserRole } from '../services/authService';
import Field from '../components/ui/Field';
import { ERROR_MESSAGES, FORM_LABELS, ROLES } from '../constants';
import { getErrorMessage } from '../utils/errors';

const EditAttendee = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', mobileNumber: '' });
    const [error, setError] = useState('');

    // Only an admin may change the email -- doing it as a user would detach the
    // registration from their account. The server rejects it either way; this
    // just makes the rule visible.
    const isAdmin = getUserRole() === ROLES.ADMIN;

    useEffect(() => {
        getAttendeeById(id)
            .then(res => setFormData(res.data))
            .catch(() => setError(ERROR_MESSAGES.LOAD_ATTENDEE_FAILED));
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
                setError(getErrorMessage(err, ERROR_MESSAGES.UPDATE_ATTENDEE_FAILED));
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
                <h2 className="ea-title">{isAdmin ? 'Edit Attendee' : 'Edit My Registration'}</h2>

                {/* Standardized Error Banner */}
                {error && (
                    <div className="alert-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="ea-form">
                    <Field variant="ea" label={FORM_LABELS.FULL_NAME} name="name" value={formData.name || ''} onChange={handleChange} required />

                    <Field variant="ea" label={FORM_LABELS.MOBILE_NUMBER} type="tel" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} />

                    <div>
                        <label className="ea-label">
                            {FORM_LABELS.EMAIL}
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            required
                            readOnly={!isAdmin}
                            className={`ea-input${isAdmin ? '' : ' ea-input-locked'}`}
                        />
                        {!isAdmin && (
                            <p className="ea-hint">Only an admin can change the email on a registration.</p>
                        )}
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
