import { useContext } from 'react';
import { ConfirmContext } from '../context/confirmContext';

/**
 * Opens the app-wide confirm dialog and resolves true/false when it closes.
 * Separate from ConfirmProvider.jsx so each file exports only one kind of
 * thing -- see the note in context/confirmContext.js.
 *
 *   const confirm = useConfirm();
 *   if (!await confirm({ message, tone: 'danger' })) return;
 */
export const useConfirm = () => {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
    return ctx.confirm;
};