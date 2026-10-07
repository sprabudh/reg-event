import { useState } from 'react';
import Input from './Input';
import { ERROR_MESSAGES } from '../../constants';

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

            {/* FIX: Don't show the pink box for password mismatch, because matchState handles it below */}
            {error && error !== ERROR_MESSAGES.PASSWORD_MISMATCH && (
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