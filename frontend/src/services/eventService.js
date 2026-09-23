import api from './api';

export const getEvents = (page = 0, size = 10, name = '', categoryId = '') => {
    let url = `/events?page=${page}&size=${size}`;
    if (name) url += `&name=${name}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    return api.get(url);
};

export const getEventById = (id) => {
    return api.get(`/events/${id}`);
};

export const createEvent = (eventData) => {
    return api.post('/events', eventData);
};

export const updateEvent = (id, eventData) => {
    return api.put(`/events/${id}`, eventData);
};

export const deleteEvent = (id) => {
    return api.delete(`/events/${id}`);
};

export const getEventStats = (id) => api.get(`/events/${id}/stats`);