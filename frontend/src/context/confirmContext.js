import { createContext } from 'react';

/**
 * Lives in a plain .js file rather than alongside the provider because
 * eslint's react-refresh rule rejects a file that exports both a component
 * and a helper -- it breaks fast refresh while developing. Splitting the
 * context, the provider and the hook keeps each file exporting one kind of
 * thing. See the same note in constants/auth.constants.js.
 */
export const ConfirmContext = createContext(null);