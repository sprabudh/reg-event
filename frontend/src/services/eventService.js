import api from './api';

export const getEvents = (page = 0, size = 10) => {
    return api.get(`/events?page=${page}&size=${size}`);
};

export const getEventById = (id) => {
    return api.get(`/events/${id}`);
};

export const createEvent = (eventData) => {
    return api.post('/events', eventData);
};

export const deleteEvent = (id) => {
    return api.delete(`/events/${id}`);
};