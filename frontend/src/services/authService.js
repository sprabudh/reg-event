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

export const storeSession = ({ token, user }) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    if (user?.role) {
        localStorage.setItem(STORAGE_KEYS.ROLE, user.role);
    }
    if (user?.name) {
        localStorage.setItem(STORAGE_KEYS.USER_NAME, user.name);
    }
};

export const registerAdmin = (userData) => {
    return api.post(AUTH.REGISTER_ADMIN, userData);
};
