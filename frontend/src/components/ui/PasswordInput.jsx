import { useState } from 'react';
import Input from './Input';
import { ERROR_MESSAGES } from '../../constants';

/**
 * Password input with a Show/Hide toggle sitting inside the field.
 *
 * The <input> is uncontrolled so it can be driven by react-hook-form's
 * `register()` (ref/name/onChange/onBlur are spread onto it).
 *
 * Renders the same DOM the hand-rolled version used:
 *   <div class="au-input-wrapper">
 *     <input class="au-input au-input-padded">
 *     <button class="au-toggle-btn">Show</button>
 *   </div>
 *   <red banner when invalid>
 *   <match line>
 *
 * Pass `matchState` as null to hide the match line; the page decides that
 * based on whether the confirm field has any value yet.
 */
const PasswordInput = ({
    error,
    matchState,
    variant = 'au',
    className = '',
    ...rest
}) => {
    const [visible, setVisible] = useState(false);

    const isAdmin = variant === 'ar';
    const inputClass = (isAdmin ? 'ar-input au-input-padded' : `au-input au-input-padded ${className}`.trim());

    return (
        <>
            <div className="au-input-wrapper">
                <Input
                    type={visible ? 'text' : 'password'}
                    className={inputClass}
                    {...rest}
                />
                <button
                    type="button"
                    className="au-toggle-btn"
                    onClick={() => setVisible((v) => !v)}
                    tabIndex="-1"
                    style={isAdmin ? { color: '#ffc107' } : undefined}
                >
                    {visible ? 'Hide' : 'Show'}
                </button>
            </div>

            {error && (
                <div className={isAdmin ? 'ar-format-feedback' : 'au-format-feedback'}>
                    {error}
                </div>
            )}

            {matchState && (
                <div
                    className={`au-live-feedback ${matchState.matched ? 'feedback-success' : 'feedback-error'}`}
                    role="status"
                >
                    {matchState.matched ? ERROR_MESSAGES.PASSWORD_MATCH : ERROR_MESSAGES.PASSWORD_MISMATCH}
                </div>
            )}
        </>
    );
};

export default PasswordInput;
