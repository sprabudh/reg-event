import { NAV_LABELS } from '../../constants';

const Footer = () => (
    <footer className="lay-footer">
        <p>{NAV_LABELS.FOOTER(new Date().getFullYear())}</p>
    </footer>
);

export default Footer;
