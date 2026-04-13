/**
 * MembersPage exemplar test — smoke test of the "fetch then render list" path.
 *
 * Goal: prove that when the page mounts, it calls the shared api to load
 * members and renders at least one member name in the DOM. This is the
 * narrowest possible round-trip test for a feature page.
 *
 * Mocking strategy:
 *   - Mock the shared axios wrapper (`shared/services/api`) so `api.get` is
 *     a jest.fn() returning a fixed payload shape that matches what the
 *     backend would normally send after the response interceptor unwraps
 *     the envelope (see api.js — `response.data` is already the inner data).
 *   - Mock `useGymSocket` to a no-op because a real socket.io client in a
 *     test run would be both noisy and pointless.
 *   - Mock `AppLayout` and `DataTable` down to trivial passthroughs so the
 *     test doesn't pull in the whole shared UI kit. DataTable replacement
 *     just renders each row's `name` cell — enough to assert on.
 *   - Mock `useAuth` so we don't need to wrap in AuthProvider (which would
 *     trigger its own GET /auth/me on mount).
 *
 * What this test does NOT cover (by design):
 *   - Pagination, filtering, sorting, modals — copy this pattern and add
 *     targeted tests per behaviour.
 *   - Real-time updates via socket — pointless to test without a real socket.
 *   - Row click / edit / delete flows — separate test per flow.
 *
 * Copy this file when you need a "render a list from an endpoint" smoke test
 * for a new feature page. Watch out for: every heavy shared component the
 * page imports needs its own jest.mock, or you will chase render errors
 * instead of writing the test.
 */

/* eslint-disable import/first */

// ── Mocks ──────────────────────────────────────────────────────────────────

// Shared axios — the workhorse. All API calls the page makes go through here.
// We use `mockImplementation` to serve different payloads per URL so the
// various `useEffect` fetches (`/contacts`, `/settings`, `/reminders/...`)
// don't all collide into one response shape.
const mockApiGet = jest.fn();
const mockApiPost = jest.fn();
const mockApiPut = jest.fn();
const mockApiDelete = jest.fn();
jest.mock('../../../shared/services/api', () => ({
    __esModule: true,
    default: {
        get: (...args) => mockApiGet(...args),
        post: (...args) => mockApiPost(...args),
        put: (...args) => mockApiPut(...args),
        delete: (...args) => mockApiDelete(...args),
    },
}));

// useGymSocket — subscribes to socket events. No-op in tests.
jest.mock('../../../shared/hooks/useGymSocket', () => ({
    __esModule: true,
    default: () => {},
}));

// useDebouncedCallback — collapse to identity so the test doesn't have to
// advance timers for debounce fires.
jest.mock('../../../shared/hooks/useDebouncedCallback', () => ({
    __esModule: true,
    default: (fn) => fn,
}));

// useAuth — dodge AuthProvider entirely. `hasFeature` returns true for every
// feature flag the page asks about; that's enough to render the happy path.
jest.mock('../../auth/context/AuthContext', () => ({
    useAuth: () => ({
        hasFeature: () => true,
        user: { role: 'gymadmin', gymId: 'g1' },
    }),
}));

// AppLayout — just a div passthrough so we don't pull in the top nav, socket
// provider, theme context, etc. that it normally depends on.
jest.mock('../../../shared/components/layout/AppLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="app-layout">{children}</div>,
}));

// DataTable — render each row's `name` in a <li> so we can assert on the
// expected member name appearing in the DOM.
jest.mock('../../../shared/components/data/DataTable', () => ({
    __esModule: true,
    default: ({ data = [] }) => (
        <ul data-testid="data-table">
            {data.map((row, i) => (
                <li key={row._id || i}>{row.name}</li>
            ))}
        </ul>
    ),
}));

// DatePicker and modals — none of the init-load paths need them, so stub
// with null components to keep the tree shallow.
jest.mock('../../../shared/components/ui/DatePicker', () => ({
    __esModule: true,
    DatePicker: () => null,
}));
jest.mock('../components/EditMemberModal', () => ({
    __esModule: true,
    default: () => null,
}));
jest.mock('../components/RecordPaymentModal', () => ({
    __esModule: true,
    default: () => null,
}));
jest.mock('../../../shared/components/feedback/ConfirmModal', () => ({
    __esModule: true,
    default: () => null,
}));
jest.mock('../components/ImportModal', () => ({
    __esModule: true,
    default: () => null,
}));

// react-hot-toast — kill the portal.
jest.mock('react-hot-toast', () => {
    const toast = Object.assign(jest.fn(), {
        success: jest.fn(),
        error: jest.fn(),
    });
    return { __esModule: true, default: toast, Toaster: () => null };
});

// framer-motion — render passthroughs.
jest.mock('framer-motion', () => ({
    __esModule: true,
    motion: new Proxy(
        {},
        {
            get: () => ({ children, ...rest }) => <div {...rest}>{children}</div>,
        },
    ),
    AnimatePresence: ({ children }) => <>{children}</>,
}));

import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../../test/renderWithProviders';
import MembersPage from './MembersPage';

// ── Fixture ────────────────────────────────────────────────────────────────

const MEMBERS_PAYLOAD = {
    data: [
        {
            _id: 'm1',
            name: 'Alice Anderson',
            phone: '919999000001',
            plan: '1-Month',
            gender: 'Female',
            status: 'Active',
            dews: 20,
            endDate: '2026-05-01T00:00:00.000Z',
            createdAt: '2026-04-01T00:00:00.000Z',
        },
    ],
    pagination: { total: 1, male: 0, female: 1 },
};

describe('MembersPage — initial load', () => {
    beforeEach(() => {
        mockApiGet.mockReset();

        // Route the mocked `api.get` by path. The page fires several
        // parallel loads on mount — give every one of them a sensible
        // default shape so no unhandled promise rejections fall out.
        mockApiGet.mockImplementation((url) => {
            if (url.startsWith('/contacts')) {
                return Promise.resolve({ data: MEMBERS_PAYLOAD });
            }
            if (url.startsWith('/settings')) {
                return Promise.resolve({ data: { plans: [] } });
            }
            if (url.startsWith('/reminders')) {
                return Promise.resolve({ data: [] });
            }
            return Promise.resolve({ data: {} });
        });
    });

    it('fetches members on mount and renders the member name in the list', async () => {
        renderWithProviders(<MembersPage />);

        // The data table mock renders each row's name as plain text; wait
        // for the fetch to resolve and the row to appear.
        await waitFor(() => {
            expect(screen.getByText('Alice Anderson')).toBeInTheDocument();
        });

        // Sanity: the first fetch should have hit /contacts with query params.
        const contactsCalls = mockApiGet.mock.calls.filter(([url]) =>
            url.startsWith('/contacts'),
        );
        expect(contactsCalls.length).toBeGreaterThan(0);
    });
});
