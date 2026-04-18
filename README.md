# fitbook – Frontend

React.js application for the N3 Gym Management platform. Built with Tailwind CSS and Context API.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configuration**
   Create `.env` based on `.env.example`:
   - `REACT_APP_BACKEND_URL`: URL of the backend API (e.g., `http://localhost:5000`)

3. **Start Development Server**
   ```bash
   npm start
   ```

## Project Structure

- **Context (`src/context`)**:
  - `AuthContext`: Handles JWT storage, user roles, and login/logout.
- **Layout (`src/layout`)**:
  - `AppLayout`: Main layout with dynamic sidebar based on user role.
- **Pages (`src/pages`)**:
  - `SuperAdminDashboard`: Platform analytics.
  - `GymDashboard`: Gym-specific stats.
  - `SaaSPlanManagement`: Super Admin plan editor.
  - `GymProfile`: Gym branding settings.
  - `Invoice`: Printable invoice view.
  - `MemberProfile`, `AllMembers`, `Register`: Member management.

## Role-Based Features

- **Super Admin**: Access to `/superadmin/*` routes.
- **Gym Admin**: Access to `/dashboard`, `/gym-profile`, `/staff`.
- **Staff**: Restricted to `/active`, `/register`, `/attendance`. Redirected from dashboard.

## Invoicing

- Invoices are generated at `/invoice/:id`.
- Requires `gymadmin` or `staff` role.
- Automatically includes Gym Logo and Contact Info.
