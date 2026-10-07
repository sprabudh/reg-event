import api from './api';
import { API_ENDPOINTS } from '../constants';

const { HOST, ADMIN } = API_ENDPOINTS;

export const getMyEvents = (page = 0, size = 20) =>
    api.get(HOST.MY_EVENTS, { params: { page, size } });

export const getMyEventById = (id) => api.get(HOST.EVENT_BY_ID(id));

export const submitEvent = (eventData) => api.post(HOST.EVENTS, eventData);

export const updateMyEvent = (id, eventData) => api.put(HOST.EVENT_BY_ID(id), eventData);

export const deleteMyEvent = (id) => api.delete(HOST.EVENT_BY_ID(id));

export const getMyEventAttendees = (eventId, page = 0, size = 30) =>
    api.get(HOST.ATTENDEES(eventId), { params: { page, size } });

export const getMyEventPayments = (eventId) =>
    api.get(HOST.PAYMENTS(eventId));

export const checkInMyAttendee = (eventId, ticketUuid) =>
    api.post(HOST.CHECK_IN(eventId, ticketUuid));

export const cancelMyAttendee = (attendeeId) =>
    api.delete(HOST.CANCEL_ATTENDEE(attendeeId));

// ---------- admin approval queue ----------

export const getPendingEvents = (status, page = 0, size = 20) =>
    api.get(ADMIN.EVENT_APPROVALS, { params: { status, page, size } });

export const approveEvent = (id) => api.post(ADMIN.APPROVE_EVENT(id));

export const rejectEvent = (id, reason) => api.post(ADMIN.REJECT_EVENT(id), { reason });

export const getApprovalCounts = () => api.get(ADMIN.COUNTS);