import { useId } from 'react';
import Input from './Input';

const FIELD_VARIANTS = {
    ef: { wrapper: 'ef-group', label: 'ef-label', control: 'ef-input' },
    ed: { wrapper: '', label: 'ed-label', control: 'ed-input' },
    ea: { wrapper: '', label: 'ea-label', control: 'ea-input' }
};

/**
 * Label + control + error. The id is generated here and wired to both the
 * <label htmlFor> and the control, so clicking the label focuses the input and
 * screen readers announce the field's name -- previously the label was not
 * associated with anything.
 *
 * When `children` (a <select>) is supplied, the caller owns the child's props;
 * `rest` is not forwarded to it, since that silently dropped name/value/
 * onChange. Pass them on the child instead.
 */
const Field = ({ label, variant = 'ef', children, required, error, id: providedId, ...rest }) => {
    const { wrapper, label: labelClass, control: controlClass } = FIELD_VARIANTS[variant] ?? FIELD_VARIANTS.ef;
    const generatedId = useId();
    const controlId = providedId || generatedId;
    const errorId = error ? `${controlId}-error` : undefined;

    return (
        <div className={wrapper || undefined} style={{ display: 'flex', flexDirection: 'column' }}>
            <label className={labelClass} htmlFor={controlId}>
                {label}
                {/* Dynamically adds a red asterisk if the field is marked as required */}
                {required && <span style={{ color: '#ef4444', marginLeft: '4px' }} aria-hidden="true">*</span>}
            </label>

            {/* If children (<select>) exist, render them. Otherwise render <Input> */}
            {children ?? (
                <Input
                    id={controlId}
                    className={controlClass}
                    required={required}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={errorId}
                    {...rest}
                />
            )}

            {/* If this specific field has an error, display it in red text below the input */}
            {error && (
                <span id={errorId} role="alert" style={{ color: '#ef4444', fontSize: '12.5px', marginTop: '4px', fontWeight: 500 }}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default Field;