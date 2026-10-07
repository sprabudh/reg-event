/**
 * Pulls a human-readable message out of an axios error.
 * Handles both { message } and bare strings.
 */
export const getErrorMessage = (error, fallback) => {
    const data = error?.response?.data;

    if (typeof data === 'string' && data) return data;
    if (data && typeof data === 'object' && data.message) return data.message;

    return fallback;
};

/**
 * NEW: Safely extracts the field-level error map from Spring Boot's
 * MethodArgumentNotValidException response (e.g., {"date": "Event date must be today"}).
 */
export const getFieldErrors = (error) => {
    const data = error?.response?.data;
    if (data && typeof data === 'object' && data.errors) {
        return data.errors; // Returns the dictionary of field errors
    }
    return {}; // Returns an empty object if no field errors exist
};