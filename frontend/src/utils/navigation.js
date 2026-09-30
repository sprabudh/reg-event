/**
 * Full-page navigation on purpose.
 *
 * After login/registration the app stores the session in localStorage and
 * several components (Header, ProtectedRoute) read it during render. A
 * client-side navigate would not re-run those reads, so we force a reload.
 *
 * Keeping it in a module-level helper also keeps the assignment out of the
 * component body, where the React Compiler rejects mutating `window`.
 */
export const redirectTo = (path) => {
    window.location.href = path;
};
