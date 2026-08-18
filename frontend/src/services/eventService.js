import api from './api';

export const getEvents = (page = 0, size = 10, name = '') => {
    // If a name is searched, attach it to the URL
    let url = `/events?page=${page}&size=${size}`;
    if (name) {
        url += `&name=${name}`;
    }
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