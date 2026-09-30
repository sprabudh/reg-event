/**
 * The auth card surface. Maps to the existing .au-card class so the login and
 * register pages keep their current look.
 */
const Card = ({ children, ...rest }) => (
    <div className="au-card" {...rest}>
        {children}
    </div>
);

export default Card;
