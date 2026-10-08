import axios from 'axios';
import {
    ALL_STORAGE_KEYS,
    API_BASE_URL,
    API_ENDPOINTS,
    APP_ROUTES,
    STORAGE_KEYS
} from '../constants';

const api = axios.create({
    baseURL: API_BASE_URL
});

const REFRESH_PATH = API_ENDPOINTS.AUTH.REFRESH;


const AUTH_PATHS = [
    API_ENDPOINTS.AUTH.LOGIN,
    API_ENDPOINTS.AUTH.REGISTER_USER,
    API_ENDPOINTS.AUTH.REGISTER_ADMIN,
    API_ENDPOINTS.AUTH.LOGOUT,
    REFRESH_PATH
];

// Runs before every single request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

/**
 * In-flight refresh, shared by every request that 401s at the same moment.
 *
 * Refresh tokens rotate: each refresh retires the presented one. Without this
 * guard, N parallel 401s would fire N refreshes with the same token and all but
 * the first would be rejected, logging the user out mid-session.
 */
let refreshPromise = null;

let redirectingToLogin = false;

function endSessionAndRedirect() {
    if (redirectingToLogin) return;
    redirectingToLogin = true;
    ALL_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    // Full-page load, matching utils/navigation.js: the session is read from
    // localStorage during render, so an in-app navigate would leave the stale
    // signed-in UI on screen.
    window.location.href = APP_ROUTES.LOGIN;
}

/**
 * Trades the stored refresh token for a new pair and persists it.
 *
 * Uses bare axios rather than the `api` instance on purpose: going through
 * `api` would re-enter the response interceptor below, so a failing refresh
 * could trigger another refresh.
 */
function performRefresh() {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
        return Promise.reject(new Error('No refresh token stored'));
    }

    return axios.post(`${API_BASE_URL}${REFRESH_PATH}`, { refreshToken })
        .then(({ data }) => {
            if (data?.accessToken) {
                localStorage.setItem(STORAGE_KEYS.TOKEN, data.accessToken);
            }
            if (data?.refreshToken) {
                localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
            }
            return data;
        });
}

/**
 * On 401, try to refresh once and replay the original request.
 *
 * The access token is short-lived, so a user idling on a page will hit 401 on
 * their next action. That should be invisible to them: refresh, retry, carry on.
 * Only when the refresh itself fails (expired, revoked, or logged out
 * elsewhere) does the session actually end.
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const original = error.config;
        const status = error.response?.status;
        const url = original?.url || '';

        // A 401 from an auth endpoint is the genuine answer; don't mask it.
        if (AUTH_PATHS.some((path) => url.includes(path))) {
            return Promise.reject(error);
        }

        // `original._retriedAfterRefresh` stops an endless retry loop if the
        // replayed request is still unauthorized.
        if (status === 401 && original && !original._retriedAfterRefresh) {
            original._retriedAfterRefresh = true;

            if (!refreshPromise) {
                refreshPromise = performRefresh().finally(() => {
                    refreshPromise = null;
                });
            }

            return refreshPromise
                .then(() => api(original))
                .catch((refreshError) => {
                    endSessionAndRedirect();
                    return Promise.reject(refreshError);
                });
        }

        // No refresh token, no replay budget, or not a 401 at all.
        if (status === 401) {
            endSessionAndRedirect();
        }

        return Promise.reject(error);
    }
);

export default api;
