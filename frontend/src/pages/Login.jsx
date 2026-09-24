import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/authService';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        loginUser(formData)
            .then((response) => {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role);

                // ADD THIS LINE: Save the email they just typed in
                localStorage.setItem('userName', response.data.name);

                window.location.href = '/';
            })
            .catch(() => setError('Invalid email or password'));
    };

    return (
        <div className="au-wrap">
            <div className="au-card">
                <h1 className="au-brand">Eventora</h1>
                <h2 className="au-sub">Welcome Back!</h2>

                {error && <div className="au-error">{error}</div>}

                <form onSubmit={handleSubmit} className="au-form">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                        className="au-input"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                        className="au-input"
                    />
                    <button type="submit" className="au-btn">Login</button>
                </form>

                <p className="au-linktext">
                    Don't have an account? <Link to="/register" className="au-link">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;