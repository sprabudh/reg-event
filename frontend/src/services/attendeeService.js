import api from './api';

export const registerAttendee = (eventId, attendeeData) => {
    return api.post(`/events/${eventId}/attendees`, attendeeData);
};

export const getAttendeesByEvent = (eventId, page = 0, size = 10) => {
    return api.get(`/events/${eventId}/attendees?page=${page}&size=${size}`);
};
