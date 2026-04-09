import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

/**
 * Centralised "is there an unsaved form?" tracker.
 *
 * Replaces the old `window.isRegistrationDirty` global. Forms call
 * `setDirty(true)` when they accumulate unsaved input and `setDirty(false)`
 * after a successful save / cancel.
 *
 * Layouts and route guards read `isDirty` to decide whether to prompt
 * "are you sure?" before navigating away.
 */

const FormStateContext = createContext({
    isDirty: false,
    setDirty: () => { },
});

export function FormStateProvider({ children }) {
    const [isDirty, setDirty] = useState(false);

    // Browser-level "leave page?" prompt as a safety net.
    useEffect(() => {
        if (!isDirty) return undefined;
        const handler = (e) => {
            e.preventDefault();
            // Chrome requires returnValue to be set.
            e.returnValue = '';
            return '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [isDirty]);

    const value = { isDirty, setDirty };
    return <FormStateContext.Provider value={value}>{children}</FormStateContext.Provider>;
}

export function useFormState() {
    return useContext(FormStateContext);
}

/**
 * Convenience hook for forms — call once with the form's "is anything
 * different from the initial state" boolean and the global flag stays
 * in sync (and resets on unmount).
 */
export function useTrackDirty(isDirty) {
    const { setDirty } = useFormState();
    useEffect(() => {
        setDirty(Boolean(isDirty));
        return () => setDirty(false);
    }, [isDirty, setDirty]);
}
