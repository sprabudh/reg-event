import api from './api';

export const registerAttendee = (eventId, attendeeData) => {
    return api.post(`/events/${eventId}/attendees`, attendeeData);
};

export const getAttendeesByEvent = (eventId, page = 0, size = 100) => {
    return api.get(`/events/${eventId}/attendees?page=${page}&size=${size}`);
};

export const getMyTickets = (page = 0, size = 100) => {
    return api.get(`/attendees/me`, { params: { page, size } });
};

export const getMyRegistrations = () => {
    return api.get(`/attendees/me/registrations`);
};

export const getEventPayments = (eventId) => {
    return api.get(`/events/${eventId}/payments`);
};

export const getAttendeeById = (id) => {
    return api.get(`/attendees/${id}`);
};

export const updateAttendee = (id, attendeeData) => {
    return api.put(`/attendees/${id}`, attendeeData);
};

export const deleteAttendee = (id) => {
    return api.delete(`/attendees/${id}`);
};

export const checkInAttendee = (eventId, ticketUuid) => {
    return api.post(`/events/${eventId}/checkin/${ticketUuid}`);
};

