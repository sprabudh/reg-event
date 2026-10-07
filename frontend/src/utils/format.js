/**
 * Shared display formatters used across the event pages.
 */

/**
 * Turns a stored host identifier into a display name: an email like
 * "chandan@eventora.com" becomes "Chandan"; anything else is returned as-is.
 * Falls back to `fallback` when there is no host at all, so admin-created
 * events (hosted_by_user_id NULL) still show a name.
 */
export const formatHostName = (hostName, fallback = 'Admin') => {
    if (!hostName) return fallback;
    if (hostName.includes('@')) {
        const local = hostName.split('@')[0];
        return local.charAt(0).toUpperCase() + local.slice(1);
    }
    return hostName;
};

/**
 * Formats an ISO timestamp as "<locale date> <HH:MM>". Returns an em dash for
 * null/invalid input.
 */
export const formatDateTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
