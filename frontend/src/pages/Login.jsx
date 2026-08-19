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
                localStorage.setItem('role', response.data.role); // ADD THIS
                window.location.href = '/';
            })
            .catch(() => setError('Invalid email or password'));
    };

    return (
        <div style={{ maxWidth: '300px', margin: '50px auto', textAlign: 'center' }}>
            <h2>Login</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="email" name="email" placeholder="Email" onChange={handleChange} required style={{ padding: '10px' }} />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={{ padding: '10px' }} />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#61dafb', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Login</button>
            </form>
            <p style={{ marginTop: '20px' }}>Don't have an account? <Link to="/register">Register here</Link></p>
        </div>
    );
};

export default Login;