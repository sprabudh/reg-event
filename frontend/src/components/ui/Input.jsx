/**
 * Bare text input -- no wrapper element.
 *
 * Deliberately does NOT wrap itself in a div: the password fields place this
 * inside .au-input-wrapper (a flex row) to host the Show/Hide button, and an
 * extra wrapper div there would stop the input filling the field width.
 *
 * Use <Field> when you want the label + error treatment around it.
 *
 * Extra props are spread straight onto the <input>, so react-hook-form's
 * `register()` return value (ref/name/onChange/onBlur) works as-is.
 * On React 19 `ref` is an ordinary prop -- no forwardRef needed.
 */
const Input = ({ type = 'text', className = '', id, ...rest }) => (
    <input id={id} type={type} className={className} {...rest} />
);

export default Input;
