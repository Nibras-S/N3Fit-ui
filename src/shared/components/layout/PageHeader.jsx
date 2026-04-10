import React from 'react';

/**
 * PageHeader — the standard "title + description" block at the top of every
 * page. Intentionally renders on a transparent background (no card) so the
 * header sits flush against the page background and doesn't compete with
 * the toolbars / cards / tables that follow.
 *
 * Layout:
 *   ┌────────────────────────────────────────────┐
 *   │ Title                              [Action] │
 *   │ Description (optional)                      │
 *   └────────────────────────────────────────────┘
 *
 * Props:
 *   title       (string, required) — page title, e.g. "Financial Dashboard"
 *   description (string, optional) — one-line context shown under the title
 *   icon        (Component, optional) — small icon shown before the title
 *   action      (ReactNode, optional) — anything (button, dropdown, group)
 *                                       rendered on the right side, top
 *   stats       (array, optional) — legacy prop, kept for back-compat with
 *                                   pages that pass {icon,label,value} chips
 *   className   (string, optional) — extra wrapper classes if a page needs
 *                                    a tighter / looser bottom margin
 *
 * The old gender-tinted card variant (gender prop) is gone — pages can wrap
 * the header in their own colored container if they really need that look.
 */
const PageHeader = ({
    title,
    description,
    icon: Icon,
    action = null,
    stats = [],
    className = '',
}) => {
    return (
        <div className={`mb-6 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
                        {Icon && (
                            <span className="text-blue-500 shrink-0">
                                <Icon />
                            </span>
                        )}
                        <span className="truncate">{title}</span>
                    </h1>
                    {description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
                            {description}
                        </p>
                    )}
                    {stats.length > 0 && (
                        <div className="hidden lg:flex items-center gap-4 mt-2">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                                    {stat.icon && <stat.icon className="text-gray-400 dark:text-gray-500" />}
                                    <span>{stat.label}:</span>
                                    <span className="font-semibold text-gray-900 dark:text-gray-200">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {action && (
                    <div className="shrink-0 flex items-center gap-2 flex-wrap">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PageHeader;
