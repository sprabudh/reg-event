/**
 * Button that maps onto the existing CSS classes instead of inventing new
 * ones -- index.css applies `button, .btn` globally with a `!important`
 * color, so any new class would be fighting that cascade.
 */

const VARIANT_CLASSES = {
    primary: '',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    auth: 'au-btn',
    admin: 'ar-btn'
};

const Button = ({
    children,
    variant = 'primary',
    size,
    isLoading = false,
    className = '',
    disabled,
    type = 'button',
    ...rest
}) => {
    const classes = [VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary, size, className]
        .filter(Boolean)
        .join(' ');

    return (
        <button type={type} className={classes.trim()} disabled={disabled || isLoading} {...rest}>
            {isLoading ? 'Loading...' : children}
        </button>
    );
};

export default Button;
