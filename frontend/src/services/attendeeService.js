import api from './api';
import { API_ENDPOINTS } from '../constants';

const { ATTENDEES } = API_ENDPOINTS;

export const registerAttendee = (eventId, attendeeData) => {
    return api.post(ATTENDEES.REGISTER(eventId), attendeeData);
};

export const getAttendeesByEvent = (eventId, page = 0, size = 30) => {
    return api.get(ATTENDEES.BY_EVENT(eventId), { params: { page, size } });
};

export const getMyTickets = (page = 0, size = 30) => {
    return api.get(ATTENDEES.ME, { params: { page, size } });
};

export const getMyRegistrations = () => {
    return api.get(ATTENDEES.MY_REGISTRATIONS);
};

export const getEventPayments = (eventId) => {
    return api.get(API_ENDPOINTS.EVENTS.PAYMENTS(eventId));
};

export const getAttendeeById = (id) => {
    return api.get(ATTENDEES.BY_ID(id));
};

export const updateAttendee = (id, attendeeData) => {
    return api.put(ATTENDEES.BY_ID(id), attendeeData);
};

export const deleteAttendee = (id) => {
    return api.delete(ATTENDEES.BY_ID(id));
};

export const checkInAttendee = (eventId, ticketUuid) => {
    return api.post(ATTENDEES.CHECK_IN(eventId, ticketUuid));
};
