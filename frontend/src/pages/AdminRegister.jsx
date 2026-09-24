import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerAdmin } from '../services/authService';

const AdminRegister = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        registerAdmin(formData)
            .then((response) => {
                // Save the token and the ADMIN role to the browser
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);
                window.location.href = '/'; // Go to dashboard
            })
            .catch(() => setError('Admin registration failed. Try a different email.'));
    };

    return (
        <div className="ar-wrap">
            <h2 className="ar-title">🛡️ Admin Setup Portal</h2>
            <p className="ar-sub">Create an elevated access account.</p>

            {error && <p className="ar-error">{error}</p>}

            <form onSubmit={handleSubmit} className="ar-form">
                <input type="text" name="name" placeholder="Admin Full Name" onChange={handleChange} required className="ar-input" />
                <input type="email" name="email" placeholder="Admin Email Address" onChange={handleChange} required className="ar-input" />
                <input type="password" name="password" placeholder="Secure Password" onChange={handleChange} required className="ar-input" />

                <button type="submit" className="ar-btn">
                    Create Admin Account
                </button>
            </form>

            <p className="ar-foot">
                Not an admin? <Link to="/register" className="ar-link">Normal Registration</Link>
            </p>
        </div>
    );
};

export default AdminRegister;