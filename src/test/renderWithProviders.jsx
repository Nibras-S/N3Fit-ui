/**
 * renderWithProviders — minimal RTL render helper for the N3Fit UI.
 *
 * Wraps the unit under test in the smallest set of providers needed to boot
 * a real page:
 *   - MemoryRouter: every page in this app assumes it's inside a React Router,
 *     so we provide a MemoryRouter instead of BrowserRouter (no jsdom history
 *     pollution between tests). Pass `initialEntries` to deep-link.
 *
 * What this helper deliberately does NOT wrap:
 *   - AuthProvider: it fires a GET /auth/me on mount which would force every
 *     test to mock the api module. Tests that need it should wrap manually
 *     OR mock `features/auth/context/AuthContext` inline. See LoginPage.test.jsx
 *     for an example.
 *   - NotificationProvider: pulls in a socket.io client. Tests that need a
 *     page using `useGymSocket` should mock `shared/hooks/useGymSocket` to a
 *     no-op. See MembersPage.test.jsx for an example.
 *   - ThemeProvider / FormStateProvider: low-value in tests, skip unless
 *     the unit under test reads from them.
 *
 * If a future test needs the full provider tree, build it from
 * `src/app/providers.jsx` and add a second helper here — don't expand this
 * one to cover every case or you'll couple every test to every context.
 */

import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Fresh QueryClient per render so tests don't share cache. Retries off so
// a single queryFn rejection becomes a test failure immediately instead of
// hanging until the RTL timeout.
function makeTestQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0, staleTime: 0 },
            mutations: { retry: false },
        },
    });
}

export function renderWithProviders(ui, { route = '/', ...renderOptions } = {}) {
    const queryClient = makeTestQueryClient();
    function Wrapper({ children }) {
        return (
            <QueryClientProvider client={queryClient}>
                <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
            </QueryClientProvider>
        );
    }
    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export RTL so tests can do `import { screen, fireEvent } from '../../test/renderWithProviders'`
// instead of juggling two imports.
export * from '@testing-library/react';
