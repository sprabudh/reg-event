import api from './api';

export const loginUser = (credentials) => {
    return api.post('/auth/authenticate', credentials);
};

export const registerUser = (userData) => {
    return api.post('/auth/register', userData);
};

export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
};

export const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};

export const getUserRole = () => {
    return localStorage.getItem('role');
};

export const getUserEmail = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
        // The JWT token stores the email in the "sub" (subject) field of the payload
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.sub;
    } catch (e) {
        return null;
    }
};