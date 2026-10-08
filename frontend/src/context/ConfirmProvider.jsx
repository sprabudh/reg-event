import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ConfirmContext } from './confirmContext';
import ConfirmDialog from '../components/ui/ConfirmDialog';


export const ConfirmProvider = ({ children }) => {
    const [request, setRequest] = useState(null);
    const resolverRef = useRef(null);

    // A second confirm() while one is already open overwrote resolverRef, and the
    // first caller then awaited a promise that could never settle -- the page
    // just stopped responding to that action. Decline the superseded prompt
    // before taking its place, so every caller gets an answer.
    const confirm = useCallback((options = {}) => new Promise((resolve) => {
        resolverRef.current?.(false);
        resolverRef.current = resolve;
        setRequest(options);
    }), []);

    const settle = useCallback((result) => {
        const resolve = resolverRef.current;
        resolverRef.current = null;
        setRequest(null);
        resolve?.(result);
    }, []);

    // Never leave a caller hanging if the provider unmounts mid-prompt.
    useEffect(() => () => {
        resolverRef.current?.(false);
        resolverRef.current = null;
    }, []);

    const value = useMemo(() => ({ confirm }), [confirm]);

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            <ConfirmDialog request={request} onSettle={settle} />
        </ConfirmContext.Provider>
    );
};