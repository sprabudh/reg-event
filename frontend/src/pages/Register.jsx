import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../services/authService';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(''); // Clear any previous errors

        // NEW: Strict Password Validation
        if (formData.password.length < 8) {
            setError("Security Requirement: Password must be at least 8 characters long.");
            return;
        }

        registerUser(formData)
            .then((response) => {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);
                window.location.href = '/';
            })
            .catch(() => setError('Registration failed. Try a different email.'));
    };

    return (
        <div className="au-wrap">
            <div className="au-card">
                <h1 className="au-brand">Eventora</h1>
                <h2 className="au-sub">Join us today</h2>

                {error && <div className="au-error">{error}</div>}

                <form onSubmit={handleSubmit} className="au-form">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        required
                        className="au-input"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        onChange={handleChange}
                        required
                        className="au-input"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password (min. 8 characters)"
                        onChange={handleChange}
                        required
                        className="au-input"
                    />
                    <button type="submit" className="au-btn">Register</button>
                </form>

                <p className="au-linktext">
                    Already have an account? <Link to="/login" className="au-link">Login here</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;