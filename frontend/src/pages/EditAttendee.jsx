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

    const role = getUserRole();
    const canManageAttendee = role === ROLES.ADMIN || role === ROLES.HOST;

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
                navigate(-1);
            })
            .catch((err) => {
                setError(getErrorMessage(err, ERROR_MESSAGES.UPDATE_ATTENDEE_FAILED));
            });
    };

    return (
        <div className="ea-wrap">
            <span
                onClick={() => navigate(-1)}
                className="ea-back"
            >
                &larr; Go Back
            </span>

            {/* Changed from "card" to "ea-card" */}
            <div className="ea-card">
                <h2 className="ea-title">{canManageAttendee ? 'Edit Attendee' : 'Edit My Registration'}</h2>

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
                            readOnly={!canManageAttendee}
                            className={`ea-input${canManageAttendee ? '' : ' ea-input-locked'}`}
                        />
                        {!canManageAttendee && (
                            <p className="ea-hint">Only an admin or the event host can change the email on a registration.</p>
                        )}
                    </div>

                    <button type="submit" className="ea-submit">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditAttendee;