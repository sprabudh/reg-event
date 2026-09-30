import api from './api';
import { API_ENDPOINTS, ALL_STORAGE_KEYS, STORAGE_KEYS } from '../constants';

const { AUTH } = API_ENDPOINTS;

export const loginUser = (credentials) => {
    return api.post(AUTH.LOGIN, credentials);
};

export const registerUser = (userData) => {
    return api.post(AUTH.REGISTER_USER, userData);
};

export const logoutUser = () => {
    ALL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

export const isAuthenticated = () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) !== null;
};

export const getUserRole = () => {
    return localStorage.getItem(STORAGE_KEYS.ROLE);
};

export const getUserName = () => {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME);
};

/** Persists the session returned by any of the auth endpoints. */
export const storeSession = ({ token, role, name }) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    if (name) {
        localStorage.setItem(STORAGE_KEYS.USER_NAME, name);
    }
};

export const registerAdmin = (userData) => {
    return api.post(AUTH.REGISTER_ADMIN, userData);
};
