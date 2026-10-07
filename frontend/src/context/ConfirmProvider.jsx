import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ConfirmContext } from './confirmContext';
import ConfirmDialog from '../components/ui/ConfirmDialog';

/**
 * Renders the single app-wide confirm dialog and exposes confirm() through
 * context.
 *
 * confirm(options) returns a Promise<boolean>, so call sites keep the shape
 * they had with window.confirm -- they just await it:
 *
 *   if (!await confirm({ message, tone: 'danger' })) return;
 *
 * The resolver lives in a ref rather than being called from inside a
 * setState updater: StrictMode can invoke updaters twice, and resolving a
 * promise is a side effect that has no business running in the render path.
 *
 * settle is stable (empty deps) on purpose -- ConfirmDialog relies on that to
 * avoid re-running its focus effect.
 */
export const ConfirmProvider = ({ children }) => {
    const [request, setRequest] = useState(null);
    const resolverRef = useRef(null);

    const confirm = useCallback((options = {}) => new Promise((resolve) => {
        resolverRef.current = resolve;
        setRequest(options);
    }), []);

    const settle = useCallback((result) => {
        resolverRef.current?.(result);
        resolverRef.current = null;
        setRequest(null);
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