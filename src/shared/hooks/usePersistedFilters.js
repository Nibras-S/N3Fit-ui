/**
 * usePersistedFilters
 *
 * Persists filter state to the backend (UserPreference API).
 * On mount: loads saved filters from DB and merges with defaults.
 * On change: debounced PUT to save the new value.
 * clearFilters: DELETEs the preference and resets to defaults.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';

const DEBOUNCE_MS = 800;

function usePersistedFilters(key, defaultFilters) {
    const [filters, setFiltersState] = useState(defaultFilters);
    const [loading, setLoading] = useState(true);
    const debounceTimer = useRef(null);
    const initialLoad = useRef(true);

    // On mount: load saved preference
    useEffect(() => {
        let cancelled = false;
        api.get(`/users/preferences/${key}`)
            .then((res) => {
                if (!cancelled && res.data?.value) {
                    setFiltersState((prev) => ({ ...prev, ...res.data.value }));
                }
            })
            .catch(() => {
                // Preference not found or network error — use defaults silently
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, [key]);

    // Whenever filters change (after initial load), debounce-save to DB
    const setFilters = useCallback((updater) => {
        setFiltersState((prev) => {
            const next = typeof updater === 'function' ? updater(prev) : updater;
            if (!initialLoad.current) {
                if (debounceTimer.current) clearTimeout(debounceTimer.current);
                debounceTimer.current = setTimeout(() => {
                    api.put(`/users/preferences/${key}`, { value: next }).catch(() => {});
                }, DEBOUNCE_MS);
            }
            return next;
        });
    }, [key]);

    // After first render, mark initial load complete so changes trigger saves
    useEffect(() => {
        if (!loading) initialLoad.current = false;
    }, [loading]);

    const clearFilters = useCallback(() => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        setFiltersState(defaultFilters);
        api.delete(`/users/preferences/${key}`).catch(() => {});
    }, [key, defaultFilters]);

    return [filters, setFilters, clearFilters, loading];
}

export default usePersistedFilters;
