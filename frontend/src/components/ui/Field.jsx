import Input from './Input';

/**
 * Label + control pair -- the block every form field in the app repeats.
 *
 * Each page themes its own form with its own CSS prefix, so instead of making
 * callers pass three classNames, they pass one `variant` and the class mapping
 * lives here. Adding a new themed form means adding one entry to the map.
 *
 * Pass `children` to supply the control (used for <select> and checkboxes);
 * otherwise a bare <Input> is rendered with the variant's control class.
 *
 * Renders exactly the markup the pages had inline before:
 *   <div className={wrapper}><label className={label}>{label}</label>{control}</div>
 * with a class-less wrapper div where the page had one.
 */
const FIELD_VARIANTS = {
    ef: { wrapper: 'ef-group', label: 'ef-label', control: 'ef-input' },
    ed: { wrapper: '', label: 'ed-label', control: 'ed-input' },
    ea: { wrapper: '', label: 'ea-label', control: 'ea-input' }
};

const Field = ({ label, variant = 'ef', children, ...rest }) => {
    const { wrapper, label: labelClass, control: controlClass } = FIELD_VARIANTS[variant] ?? FIELD_VARIANTS.ef;

    return (
        <div className={wrapper || undefined}>
            <label className={labelClass}>{label}</label>
            {children ?? <Input className={controlClass} {...rest} />}
        </div>
    );
};

export default Field;
