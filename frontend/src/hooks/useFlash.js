import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Success-toast helper: flash(message) shows the message and clears it after
 * `duration` ms. Replaces the repeated
 *   setSuccess(msg); setTimeout(() => setSuccess(''), 3000)
 * pattern on the admin/host pages. The timer is cleaned up on unmount.
 */
const useFlash = (duration = 3000) => {
    const [message, setMessage] = useState('');
    const timerRef = useRef(null);

    const flash = useCallback((msg) => {
        setMessage(msg);
        timerRef.current = setTimeout(() => setMessage(''), duration);
    }, [duration]);

    const clear = useCallback(() => setMessage(''), []);

    useEffect(() => () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    return [message, flash, clear];
};

export default useFlash;
