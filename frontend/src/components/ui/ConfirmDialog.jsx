import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';
import { CONFIRM_LABELS } from '../../constants';

const FOCUSABLE = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
].join(', ');

/**
 * Yes/no confirmation dialog, rendered into a portal so ancestor overflow
 * (.dl-scroll, .el-* all set it) can't clip it.
 *
 * A native window.confirm gives you focus trapping, Escape and screen-reader
 * semantics for free. This rebuilds all of that deliberately -- without it
 * the replacement would be a regression, not an upgrade.
 *
 * Tone drives severity: 'danger' adds the red accent and a destructive
 * confirm button. Callers own the wording (see PROMPTS); this only renders it.
 */
const ConfirmDialog = ({ request, onSettle }) => {
    const dialogRef = useRef(null);

    const titleId = useId();
    const messageId = useId();

    const isOpen = !!request;
    const tone = request?.tone ?? 'default';

    // onSettle must be referentially stable (ConfirmProvider builds it with
    // useCallback([])). If it weren't, this effect's cleanup would restore
    // focus and the effect would immediately re-focus the dialog -- a visible
    // flicker every time the parent re-renders.
    useEffect(() => {
        if (!isOpen) return;

        const previouslyFocused = document.activeElement;
        dialogRef.current?.focus();

        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                onSettle(false);
                return;
            }
            if (event.key !== 'Tab') return;

            const nodes = dialogRef.current?.querySelectorAll(FOCUSABLE);
            if (!nodes?.length) return;

            const first = nodes[0];
            const last = nodes[nodes.length - 1];

            // Cycle within the dialog instead of escaping to the page behind.
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };

        document.addEventListener('keydown', onKeyDown);

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = previousOverflow;
            // Send focus back to whatever opened the dialog.
            previouslyFocused?.focus?.();
        };
    }, [isOpen, onSettle]);

    if (!isOpen) return null;

    return createPortal(
        <div className="md-backdrop" onClick={() => onSettle(false)}>
            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={messageId}
                tabIndex={-1}
                className={`md-dialog md-${tone}`}
                onClick={(event) => event.stopPropagation()}
            >
                <h2 id={titleId} className="md-title">
                    {request.title ?? CONFIRM_LABELS.DEFAULT_TITLE}
                </h2>
                <p id={messageId} className="md-message">
                    {request.message}
                </p>

                <div className="md-actions">
                    <Button variant="secondary" onClick={() => onSettle(false)}>
                        {CONFIRM_LABELS.CANCEL}
                    </Button>
                    <Button
                        variant={tone === 'danger' ? 'danger' : 'primary'}
                        onClick={() => onSettle(true)}
                    >
                        {request.confirmLabel ?? CONFIRM_LABELS.CONFIRM}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ConfirmDialog;