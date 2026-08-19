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