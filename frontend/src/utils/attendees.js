import { REGISTRATION_STATUS } from '../constants';

/**
 * Filters attendees by a name/email search term and orders CONFIRMED above
 * WAITLISTED so check-in candidates surface first. Shared by the admin and
 * host event detail pages.
 */
export const filterAndSortAttendees = (attendees, searchTerm) => {
    const filtered = attendees.filter(
        (a) =>
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return [...filtered].sort((a, b) => {
        const statusA = a.status || REGISTRATION_STATUS.CONFIRMED;
        const statusB = b.status || REGISTRATION_STATUS.CONFIRMED;
        if (statusA === REGISTRATION_STATUS.CONFIRMED && statusB === REGISTRATION_STATUS.WAITLISTED) return -1;
        if (statusA === REGISTRATION_STATUS.WAITLISTED && statusB === REGISTRATION_STATUS.CONFIRMED) return 1;
        return 0;
    });
};
