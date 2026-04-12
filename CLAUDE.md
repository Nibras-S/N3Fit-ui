# N3Fit-ui — Frontend Conventions

React 18 + CRA + vanilla JavaScript + Context API + Tailwind 3.4. Feature-based architecture under [src/features/](src/features/). See the parent [../CLAUDE.md](../CLAUDE.md) for product context and cross-project rules.

## Feature anatomy

Each feature mirrors its backend module name and owns its own components, pages, and (when needed) context:

```
src/features/members/
├── components/          # reusable within the feature
│   ├── MemberTable.jsx
│   ├── MemberForm.jsx
│   └── EditMemberModal.jsx
└── pages/               # routed screens
    ├── MembersPage.jsx
    └── MembershipCardPage.jsx
```

Features can also contain:

- `context/` — feature-scoped React context (e.g., [features/auth/context/AuthContext.jsx](src/features/auth/context/AuthContext.jsx), [features/notifications/context/NotificationContext.jsx](src/features/notifications/context/NotificationContext.jsx)). These are the only contexts that live inside a feature; everything else goes in [src/shared/context/](src/shared/context/).
- Feature-local hooks inline in components when needed.

Shared primitives live under [src/shared/](src/shared/): `components/`, `hooks/`, `context/`, `services/`, `lib/`, `styles/`.

## API calls — one axios instance, no exceptions

All HTTP goes through the shared instance at [src/shared/services/api.js](src/shared/services/api.js). It does three things you need to know:

1. **`withCredentials: true`** — the httpOnly JWT cookie rides along automatically. Never read, write, or attach an `Authorization` header. Never touch `localStorage` for auth.
2. **Response envelope auto-unwrap** — the backend returns `{ success: true, data: {...} }`; the interceptor strips the envelope so callers just see `response.data === data`. Don't re-implement unwrapping in feature code.
3. **Global error handling** — 401 redirects to `/login` (except on public routes), 403/422/400/5xx all surface toasts via `showToast.error`. Feature code should let errors propagate and only catch them to clear local loading state, not to show error UIs.

Example pattern (from existing features):

```js
import api from 'shared/services/api';

async function loadMembers() {
  try {
    const res = await api.get('/members', { params: { page: 1 } });
    setMembers(res.data.items);   // envelope already stripped
  } catch (err) {
    // toast already shown by interceptor — just clear loading state
    setLoading(false);
  }
}
```

Never create a second axios instance, even with a different `baseURL`. If you need to hit a non-api origin (e.g., a presigned S3 URL), use bare `fetch` or `axios.get` without the shared instance.

## Providers and context

The provider tree is composed in [src/app/providers.jsx](src/app/providers.jsx):

```
ErrorBoundary → AuthProvider → NotificationProvider → FormStateProvider → children
```

Order matters — NotificationProvider needs AuthProvider (it subscribes to socket events keyed on the current user's `gymId`). When adding a new global context, add it here in the right position, not in `index.js` or `App.jsx`.

- `AuthContext` — current user, role, login/logout. Exposed via `useAuth()`.
- `NotificationContext` — socket connection + notification list.
- `FormStateContext` — cross-page form draft persistence.
- `ThemeContext` — lives outside in `shared/context/ThemeContext.jsx`, wrapped at the Router level in `index.js`.

Context only — no Redux, no Zustand, no Tanstack Query. Don't introduce them opportunistically; if state is getting complex, lift it or break it into multiple contexts first.

## Socket.io

All socket subscriptions go through [src/shared/hooks/useGymSocket.js](src/shared/hooks/useGymSocket.js). It joins the gym room on mount and subscribes to events by name. Don't instantiate `io()` directly in a feature — you'll fork connection management and miss the global reconnect logic.

Event naming follows `<resource>:<action>` past tense: `transaction:created`, `member:updated`. This must match the emit names on the backend — grep [N3Fit-api/src/modules/](../N3Fit-api/src/modules/) for `emitToGym(` to confirm the exact event string.

## Routing

Routes are declared in [src/app/routes.jsx](src/app/routes.jsx). When adding a new feature page:

1. Lazy-load the page: `const MembersPage = lazy(() => import('features/members/pages/MembersPage'));`
2. Wrap in `<ProtectedRoute>` if it requires auth.
3. Wrap in `<RoleGate allowed={['gymadmin', 'staff']}>` if it's role-restricted.
4. Public routes (landing, login) sit outside ProtectedRoute.

## Styling — Tailwind only

- Tailwind utility classes are the default. Brand colors are configured in `tailwind.config.js`.
- `react-aria-components` for accessible form primitives (modals, popovers, listboxes). Prefer it over raw `<div role="...">` or one-off headless libraries.
- `tailwindcss-animate` for motion utilities.
- No CSS modules, no styled-components, no emotion. If a component needs complex styling, compose Tailwind classes in a local `className` variable or split into smaller components.

## Forms

- For simple forms, plain `useState` is fine.
- `FormStateContext` persists in-progress forms across navigation (e.g., half-filled member creation). Use it when navigating away shouldn't lose input.
- No form library (react-hook-form, formik) is in use — don't introduce one without a clear need and an explicit ask.

## Auth posture — reinforced

Repeating from the root rules because this is the most common footgun:

- **Never read or write JWT to `localStorage` / `sessionStorage`.**
- **Never attach an `Authorization` header.**
- **Never send `gymId` in a request body** — the backend derives it from `req.user.gymId` and ignores client-sent values.
- On logout, hit `POST /auth/logout` so the backend clears the cookie; don't try to clear it client-side.

## Testing

RTL + Jest are configured via CRA, but **no tests exist yet**. When the task is to add tests:

- Smoke tests per page: render + check landmark text/buttons.
- Mock the axios instance via `jest.mock('shared/services/api')`.
- The `test-bootstrap-engineer` subagent can scaffold the initial setup and write the first 2–3 exemplar tests.

## Common tasks

- **Add a new feature page:** create `features/<name>/pages/<Name>Page.jsx`, lazy-load in `app/routes.jsx`, wrap in `ProtectedRoute` / `RoleGate` as needed.
- **Call a new backend endpoint:** `api.get('/path')` via the shared instance, let errors propagate, only use `response.data` (envelope already stripped).
- **Subscribe to a new socket event:** add the event name to `useGymSocket` and consume via the returned handler.
- **Add a global context:** create in `shared/context/` (or in the feature if tightly scoped), insert in `providers.jsx` in the correct order.
