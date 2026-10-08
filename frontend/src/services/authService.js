import api from './api';
import { API_ENDPOINTS, ALL_STORAGE_KEYS, STORAGE_KEYS } from '../constants';

const { AUTH } = API_ENDPOINTS;

export const loginUser = (credentials) => {
    return api.post(AUTH.LOGIN, credentials);
};

export const registerUser = (userData) => {
    return api.post(AUTH.REGISTER_USER, userData);
};


export const logoutUser = async () => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    try {
        if (refreshToken) {
            await api.post(AUTH.LOGOUT, { refreshToken });
        }
    } catch {
        // Ignored on purpose: see above. Never block the local sign-out.
    } finally {
        clearSession();
    }
};

/** Drops the session without calling the server (used when a token is already dead). */
export const clearSession = () => {
    ALL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
};

/** True while either credential is present. */
export const isAuthenticated = () => {
    return localStorage.getItem(STORAGE_KEYS.TOKEN) !== null
        || localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) !== null;
};

export const hasRefreshToken = () => localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN) !== null;

export const getUserRole = () => {
    return localStorage.getItem(STORAGE_KEYS.ROLE);
};

export const getUserName = () => {
    return localStorage.getItem(STORAGE_KEYS.USER_NAME);
};

/**
 * Persists a token pair plus the identity behind it.
 *
 * Both tokens are stored: the short-lived access token authenticates API calls,
 * the refresh token keeps the session alive past its expiry. Role and name are
 * cached because Header/ProtectedRoute read them during render.
 */
export const storeSession = ({ accessToken, refreshToken, user }) => {
    if (accessToken) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
    }
    if (refreshToken) {
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
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
