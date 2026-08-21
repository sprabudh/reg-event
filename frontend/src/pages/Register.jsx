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
                localStorage.setItem('role', response.data.role);
                window.location.href = '/';
            })
            .catch(() => setError('Registration failed. Try a different email.'));
    };

    return (
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h1 style={styles.brandTitle}>Eventora</h1>
                <h2 style={styles.title}>Join us today</h2>

                {error && <div style={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                        style={styles.input}
                    />
                    <button type="submit" style={styles.button}>Register</button>
                </form>

                <p style={styles.linkText}>
                    Already have an account? <Link to="/login" style={styles.link}>Login here</Link>
                </p>
            </div>
        </div>
    );
};

const styles = {
    pageContainer: {
        display: 'flex',
        justifyContent: 'center',
        padding: '60px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #eaeaea',
        textAlign: 'center',
    },
    brandTitle: {
        margin: '0 0 5px 0',
        fontSize: '28px',
        color: '#4f46e5',
        fontWeight: '700',
    },
    title: {
        margin: '0 0 25px 0',
        fontSize: '18px',
        color: '#6b7280',
        fontWeight: '400',
    },
    errorMessage: {
        backgroundColor: '#fee2e2',
        color: '#991b1b',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '20px',
        fontSize: '14px',
        border: '1px solid #f87171',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    input: {
        padding: '12px 15px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        fontSize: '15px',
        color: '#111827',
        outline: 'none',
        boxSizing: 'border-box',
        width: '100%',
    },
    button: {
        marginTop: '5px',
        padding: '14px',
        backgroundColor: '#4f46e5',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)',
    },
    linkText: {
        marginTop: '25px',
        fontSize: '14px',
        color: '#6b7280',
    },
    link: {
        color: '#4f46e5',
        textDecoration: 'none',
        fontWeight: '600',
    }
};

export default Register;