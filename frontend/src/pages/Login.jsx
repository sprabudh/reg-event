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
        <div style={styles.pageContainer}>
            <div style={styles.card}>
                <h1 style={styles.brandTitle}>Eventora</h1>
                <h2 style={styles.title}>Welcome Back!</h2>

                {error && <div style={styles.errorMessage}>{error}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
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
                    <button type="submit" style={styles.button}>Login</button>
                </form>

                <p style={styles.linkText}>
                    Don't have an account? <Link to="/register" style={styles.link}>Register here</Link>
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

export default Login;