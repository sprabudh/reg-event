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
        registerUser(formData)
            .then((response) => {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('role', response.data.role); // ADD THIS
                window.location.href = '/';
            })
            .catch(() => setError('Registration failed. Try a different email.'));
    };

    return (
        <div style={{ maxWidth: '300px', margin: '50px auto', textAlign: 'center' }}>
            <h2>Create Account</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" name="name" placeholder="Full Name" onChange={handleChange} required style={{ padding: '10px' }} />
                <input type="email" name="email" placeholder="Email Address" onChange={handleChange} required style={{ padding: '10px' }} />
                <input type="password" name="password" placeholder="Password" onChange={handleChange} required style={{ padding: '10px' }} />
                <button type="submit" style={{ padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Register</button>
            </form>
            <p style={{ marginTop: '20px' }}>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
    );
};

export default Register;