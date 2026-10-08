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
    // Without this the form is submittable while empty, so a fast save would
    // overwrite the record with blank values.
    // Derived from which id has finished loading rather than set inside the effect:
// flipping a boolean synchronously in the effect body is a cascading render, and
// this stays correct when :id changes without a remount.
const [loadedId, setLoadedId] = useState(null);
    const [saving, setSaving] = useState(false);
    const loading = loadedId !== id;

    const role = getUserRole();
    const canManageAttendee = role === ROLES.ADMIN || role === ROLES.HOST;

    useEffect(() => {
        let active = true;
        getAttendeeById(id)
            .then(res => {
                if (!active) return;
                setFormData(res.data);
                setError('');
            })
            .catch(() => { if (active) setError(ERROR_MESSAGES.LOAD_ATTENDEE_FAILED); })
            .finally(() => { if (active) setLoadedId(id); });
        return () => { active = false; };
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (loading || saving) return;
        setSaving(true);
        setError('');
        updateAttendee(id, formData)
            .then(() => {
                navigate(-1);
            })
            .catch((err) => {
                setError(getErrorMessage(err, ERROR_MESSAGES.UPDATE_ATTENDEE_FAILED));
                setSaving(false);
            });
    };

    return (
        <div className="ea-wrap">
            <button type="button" onClick={() => navigate(-1)} className="ea-back">
                &larr; Go Back
            </button>

            <div className="ea-card">
                <h2 className="ea-title">{canManageAttendee ? 'Edit Attendee' : 'Edit My Registration'}</h2>

                {error && (
                    <div className="alert-error" role="alert">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="ea-hint" style={{ margin: 0 }}>Loading attendee details...</p>
                ) : (
                <form onSubmit={handleSubmit} className="ea-form">
                    <Field variant="ea" label={FORM_LABELS.FULL_NAME} name="name" value={formData.name || ''} onChange={handleChange} required />

                    <Field variant="ea" label={FORM_LABELS.MOBILE_NUMBER} type="tel" name="mobileNumber" value={formData.mobileNumber || ''} onChange={handleChange} placeholder="10-digit mobile number" inputMode="numeric" maxLength={10} />

                    <div>
                        <label className="ea-label" htmlFor="attendee-email">
                            {FORM_LABELS.EMAIL}
                        </label>
                        <input
                            id="attendee-email"
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

                    <button type="submit" className="ea-submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
                )}
            </div>
        </div>
    );
};

export default EditAttendee;