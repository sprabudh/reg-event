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
        <div style={{ maxWidth: '350px', margin: '50px auto', textAlign: 'center', backgroundColor: '#343a40', padding: '30px', borderRadius: '8px', color: 'white' }}>
            <h2 style={{ color: '#ffc107' }}>🛡️ Admin Setup Portal</h2>
            <p style={{ fontSize: '14px', marginBottom: '20px' }}>Create an elevated access account.</p>

            {error && <p style={{ color: '#ff4d4d' }}>{error}</p>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="text" name="name" placeholder="Admin Full Name" onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: 'none' }} />
                <input type="email" name="email" placeholder="Admin Email Address" onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: 'none' }} />
                <input type="password" name="password" placeholder="Secure Password" onChange={handleChange} required style={{ padding: '10px', borderRadius: '4px', border: 'none' }} />

                <button type="submit" style={{ padding: '12px', backgroundColor: '#ffc107', color: 'black', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px' }}>
                    Create Admin Account
                </button>
            </form>

            <p style={{ marginTop: '20px', fontSize: '14px' }}>
                Not an admin? <Link to="/register" style={{ color: '#61dafb' }}>Normal Registration</Link>
            </p>
        </div>
    );
};

export default AdminRegister;