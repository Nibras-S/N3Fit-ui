/**
 * Route → human-readable page title.
 *
 * Used by the mobile header to label the current page. We try exact matches
 * first, then a small list of prefix patterns for routes with `:id` segments
 * (member detail, invoice, etc).
 *
 * Keep this list in lockstep with src/app/routes.jsx — adding a route
 * without a title here will fall back to "N3 Fit" instead of crashing.
 */

const EXACT = {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/members': 'Members',
    '/register': 'New Member',
    '/inactivesoon': 'Expiring Soon',
    '/expenses': 'Expenses',
    '/transactions': 'Transactions',
    '/reports': 'Reports',
    '/reports/income': 'Income Report',
    '/reports/expense': 'Expense Report',
    '/staff': 'Staff',
    '/notifications': 'Notifications',
    '/announcement': 'Announcements',
    '/settings': 'Settings',
    '/superadmin': 'Platform',
    '/superadmin/settings': 'Platform Settings',
    '/superadmin/plans': 'SaaS Plans',
};

// Order matters — first match wins.
const PREFIX = [
    { test: /^\/members\/[^/]+$/, title: 'Member Profile' },
    { test: /^\/superadmin\/gyms\/[^/]+$/, title: 'Gym Details' },
    { test: /^\/invoice\/[^/]+$/, title: 'Invoice' },
];

export function getRouteTitle(pathname) {
    if (EXACT[pathname]) return EXACT[pathname];
    for (const { test, title } of PREFIX) {
        if (test.test(pathname)) return title;
    }
    return 'N3 Fit';
}

export default getRouteTitle;
