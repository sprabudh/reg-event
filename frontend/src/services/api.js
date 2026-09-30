import axios from 'axios';
import { API_BASE_URL } from '../constants';
import { STORAGE_KEYS } from '../constants/auth.constants';

const api = axios.create({
    baseURL: API_BASE_URL
});

// This "interceptor" runs before every single request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api;
