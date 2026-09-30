/**
 * Pulls a human-readable message out of an axios error.
 *
 * Replaces five near-identical inline implementations that had drifted apart:
 *   err.response?.data?.message || fallback   (EventForm, EventDetails)
 *   if (err.response && err.response.data)    (EventsList)
 *   err.response?.data || fallback            (ManageCategories)
 *
 * Handles both shapes the backend actually sends -- `{ message }` from the
 * GlobalExceptionHandler, and a bare string from some controllers -- so each
 * call site keeps the text it shows today.
 */
export const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data;

    if (typeof data === 'string' && data) return data;
    if (data && typeof data === 'object' && data.message) return data.message;

    return fallback;
};
