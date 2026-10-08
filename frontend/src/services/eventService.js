import api from './api';
import { API_ENDPOINTS } from '../constants';

const { EVENTS } = API_ENDPOINTS;

export const getEvents = (page = 0, size = 10, name = '', categoryId = '') => {
    // Pass params rather than building the query string by hand: interpolating
    // raw input lets a name containing `&`, `#` or `+` corrupt the query.
    return api.get(EVENTS.BASE, {
        params: {
            page,
            size,
            ...(name ? { name } : {}),
            ...(categoryId ? { categoryId } : {})
        }
    });
};

export const getEventById = (id) => {
    return api.get(EVENTS.BY_ID(id));
};

export const createEvent = (eventData) => {
    return api.post(EVENTS.BASE, eventData);
};

export const updateEvent = (id, eventData) => {
    return api.put(EVENTS.BY_ID(id), eventData);
};

export const deleteEvent = (id) => {
    return api.delete(EVENTS.BY_ID(id));
};

export const getEventStats = (id) => api.get(EVENTS.STATS(id));
