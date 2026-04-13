/**
 * LoginPage exemplar test — smoke test of the login form submit path.
 *
 * What this covers:
 *   1. The LoginPage renders without throwing when given a mocked
 *      AuthContext (no real API calls, no real router navigation).
 *   2. Typing into the email/password inputs and submitting the form calls
 *      the `login` function from AuthContext with exactly the payload the
 *      component is meant to build. This is the tightest contract between
 *      the UI and the feature's data layer.
 *
 * What this test does NOT cover (by design):
 *   - The actual axios call: `login` from AuthContext is mocked, and the
 *     real axios wrapper is separately tested at the backend integration
 *     level. Testing that the frontend's `login` fn calls `api.post('/auth/login', ...)`
 *     is one step away from testing axios itself — low value for a smoke test.
 *   - react-router navigation: `useNavigate` is mocked to a jest.fn(),
 *     so we only observe it was called, not what the history stack looks like.
 *
 * Copy this file when you need to test a form submit flow in a feature page.
 */

/* eslint-disable import/first */
// Mock BEFORE importing the component so Jest can hoist the mocks to the
// top of the file. The order-of-imports dance is load-bearing — if you
// accidentally import LoginPage first, `react-hot-toast` tries to read
// CSS properties from an unmounted DOM and the test crashes.

// Mock the AuthContext module entirely. We don't want AuthProvider's
// `useEffect(() => api.get('/auth/me'))` firing at all.
const mockLogin = jest.fn();
jest.mock('../context/AuthContext', () => ({
    useAuth: () => ({ login: mockLogin }),
}));

// Mock react-hot-toast so <Toaster /> and toast.success/error are no-ops
// instead of mounting a portal into the jsdom document.
jest.mock('react-hot-toast', () => {
    const toast = Object.assign(jest.fn(), {
        success: jest.fn(),
        error: jest.fn(),
    });
    return {
        __esModule: true,
        default: toast,
        Toaster: () => null,
    };
});

// framer-motion's animation internals are fine in jsdom, but the AnimatePresence
// wrapper is noisy in the DOM tree. Strip it down to plain passthroughs.
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

// Mock the tiny ButtonSpinner — its real implementation depends on a stack
// of shared components we don't care about here.
jest.mock('../../../shared/components/ui/Skeleton', () => ({
    ButtonSpinner: () => <span data-testid="spinner" />,
}));

// react-router-dom's useNavigate — stub it so the component can call it
// without a real Router history in the tree.
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    __esModule: true,
    useNavigate: () => mockNavigate,
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './LoginPage';

describe('LoginPage — smoke test', () => {
    beforeEach(() => {
        mockLogin.mockReset();
        mockNavigate.mockReset();
    });

    it('calls login() with the form values when the admin form is submitted', async () => {
        // Simulate a successful login — returns a gymadmin so the component
        // routes to `/dashboard`.
        mockLogin.mockResolvedValue({ role: 'gymadmin' });

        render(<LoginPage />);

        // Page renders the welcome headline from the right panel.
        expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();

        // Fill in email + password and submit. No gymCode in the admin tab.
        fireEvent.change(screen.getByPlaceholderText(/admin@fitclub\.com/i), {
            target: { value: 'admin@example.com' },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
            target: { value: 'hunter2' },
        });
        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

        // mockLogin should be called with the positional signature the
        // AuthContext exposes: (email, password, gymCode?).
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledTimes(1);
        });
        expect(mockLogin).toHaveBeenCalledWith('admin@example.com', 'hunter2', undefined);
    });
});
