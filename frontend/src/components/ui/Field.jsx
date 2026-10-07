import Input from './Input';

const FIELD_VARIANTS = {
    ef: { wrapper: 'ef-group', label: 'ef-label', control: 'ef-input' },
    ed: { wrapper: '', label: 'ed-label', control: 'ed-input' },
    ea: { wrapper: '', label: 'ea-label', control: 'ea-input' }
};

const Field = ({ label, variant = 'ef', children, required, error, ...rest }) => {
    const { wrapper, label: labelClass, control: controlClass } = FIELD_VARIANTS[variant] ?? FIELD_VARIANTS.ef;

    return (
        <div className={wrapper || undefined} style={{ display: 'flex', flexDirection: 'column' }}>
            <label className={labelClass}>
                {label}
                {/* Dynamically adds a red asterisk if the field is marked as required */}
                {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
            </label>

            {/* If children (<select>) exist, render them. Otherwise render <Input> */}
            {children ?? <Input className={controlClass} required={required} {...rest} />}

            {/* If this specific field has an error, display it in red text below the input */}
            {error && (
                <span style={{ color: '#ef4444', fontSize: '12.5px', marginTop: '4px', fontWeight: 500 }}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default Field;