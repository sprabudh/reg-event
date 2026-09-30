import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { storeSession } from '../services/authService';
import { redirectTo } from '../utils/navigation';
import { APP_ROUTES } from '../constants';

/**
 * Shared wiring for the three auth forms.
 *
 * All three previously duplicated: the apiError state, useForm + zodResolver,
 * the register() calls, the useWatch match state, and an identical submit
 * handler (call the service -> storeSession -> full reload). This pulls that
 * into one place so the pages only describe what differs: schema, endpoint,
 * and the error message to show on failure.
 *
 * @param schema       Zod schema for the form
 * @param submit       async (payload) => axios response with .data
 * @param errorMessage message shown in the top banner when submit fails
 * @param mode         react-hook-form validation mode
 * @param buildPayload optional mapper applied before calling submit
 * @param defaultValues must list every field in the schema
 */
const useAuthForm = ({
    schema,
    submit,
    errorMessage,
    mode = 'onTouched',
    buildPayload,
    defaultValues
}) => {
    const [apiError, setApiError] = useState('');

    const { register, handleSubmit, control, formState } = useForm({
        resolver: zodResolver(schema),
        mode,
        defaultValues
    });

    const { errors, isSubmitting } = formState;

    // Always called (hooks must not be conditional) -- Login just ignores them.
    const password = useWatch({ control, name: 'password' });
    const confirmPassword = useWatch({ control, name: 'confirmPassword' });

    // Only show the match line once the confirm field has something in it.
    const matchState = !confirmPassword ? null : { matched: password === confirmPassword };

    // Each field's onChange also clears the top banner, so the page doesn't
    // repeat that handler three times.
    const field = (name) => {
        const registered = register(name);
        return {
            ...registered,
            onChange: (e) => {
                setApiError('');
                registered.onChange(e);
            }
        };
    };

    const onSubmit = handleSubmit(async (values) => {
        setApiError('');
        try {
            const response = await submit(buildPayload ? buildPayload(values) : values);
            storeSession(response.data);
            // Full reload is deliberate: the header and ProtectedRoute read
            // localStorage during render, so a client-side navigate would
            // leave a stale header.
            redirectTo(APP_ROUTES.HOME);
        } catch {
            setApiError(errorMessage);
        }
    });

    return { field, errors, isSubmitting, apiError, matchState, onSubmit };
};

export default useAuthForm;
