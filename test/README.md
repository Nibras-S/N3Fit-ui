# N3Fit-ui — Test Guide

CRA already ships Jest + `@testing-library/react` + `@testing-library/jest-dom`
+ `@testing-library/user-event` in `devDependencies`, so there was nothing
new to install. This file documents the bootstrap.

## Running

```bash
# Watch mode (CRA default) — for iterating on a single test
npm test

# Single pass, CI mode — what you want for a build
CI=true npm test -- --watchAll=false

# Single pass for a specific file
CI=true npm test -- --watchAll=false src/features/members/pages/MembersPage.test.jsx
```

`CI=true` disables the interactive watch UI.

## Layout

```
N3Fit-ui/
├── src/
│   ├── setupTests.js                      # CRA auto-loads — imports jest-dom matchers
│   ├── test/
│   │   └── renderWithProviders.jsx        # Minimal RTL render helper
│   └── features/
│       ├── auth/pages/LoginPage.test.jsx      # Form submit smoke test
│       └── members/pages/MembersPage.test.jsx # Fetch + list render smoke test
└── test/
    └── README.md                          # You are here
```

Tests live next to the page they cover (same directory, `*.test.jsx`).
Don't introduce a top-level `__tests__/` directory — CRA finds co-located
tests by default and the feature-based structure keeps them discoverable.

## Writing a new test

Copy one of the two exemplars as a starting point:

| Start from                                          | When                                                      |
|-----------------------------------------------------|-----------------------------------------------------------|
| `src/features/auth/pages/LoginPage.test.jsx`        | You're testing a form submit / button click path         |
| `src/features/members/pages/MembersPage.test.jsx`   | You're testing "fetch data, render list" on a feature page |

### Mocking strategy — read this

Feature pages in this codebase pull in a lot of shared infrastructure:
AppLayout, AuthProvider, NotificationProvider, react-router, framer-motion,
react-hot-toast, and more. Rendering all of that into jsdom for a smoke
test is a losing battle — you'll chase render errors instead of writing
assertions.

Instead, mock aggressively at the top of each test file:

```jsx
// Shared axios — the workhorse. Never hit a real network.
jest.mock('shared/services/api', () => ({
    __esModule: true,
    default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

// Auth — dodge the real AuthProvider's GET /auth/me on mount.
jest.mock('features/auth/context/AuthContext', () => ({
    useAuth: () => ({ user: { role: 'gymadmin' }, hasFeature: () => true }),
}));

// Socket hook — no real socket.io in tests.
jest.mock('shared/hooks/useGymSocket', () => ({ __esModule: true, default: () => {} }));

// Heavy shared components — trivial passthroughs.
jest.mock('shared/components/layout/AppLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
}));
```

Rule of thumb: mock any import that is NOT the subject of the test.
Feature pages should act like their internal state + one live dependency
(the mocked api) under test. Everything else is a prop / context stub.

### renderWithProviders

Use the helper from `src/test/renderWithProviders.jsx` to wrap the unit
under test in a `MemoryRouter`. It deliberately does NOT include
`AuthProvider` or `NotificationProvider` — mock those at the module
boundary instead (see MembersPage.test.jsx for the pattern).

## External services

- **axios**: mock `shared/services/api` inline. Don't try to mock axios
  itself — the project's shared instance already has interceptors you'd
  need to reimplement.
- **Socket.io**: mock `shared/hooks/useGymSocket` to a no-op.
- **Toast**: mock `react-hot-toast` to a trivial `{ success, error }`
  jest.fn() pair and stub `<Toaster />` as `() => null`. Otherwise the
  portal mount pollutes jsdom.
- **framer-motion**: the `motion.*` Proxy + `AnimatePresence` passthrough
  pattern in LoginPage.test.jsx works for every page that uses it.

## Things not covered by these exemplars

Deliberately out of scope for the bootstrap:

- End-to-end browser testing — see the backend README's Playwright note.
- Visual regression / screenshot testing.
- Per-component unit tests for every shared component. Write them when a
  component grows its own non-trivial logic.
- Accessibility auditing. `@testing-library`'s queries (`getByRole`) push
  you toward accessible markup, but a dedicated a11y pass is a separate
  task.

File tickets for these as you hit the need; don't grow this suite by
accretion.
