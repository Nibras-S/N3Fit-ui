import toast from "react-hot-toast";
import React from "react";

/**
 * Toast Utility  (src/shared/lib/toast.js)
 *
 * A wrapper around react-hot-toast with styled Untitled UI–inspired notifications.
 * Provides four clear types: success, error, warning, info.
 *
 * Setup — add <ToastProvider /> once in your App.js:
 *   import { ToastProvider } from '../shared/lib/toast';
 *   function App() { return ( <><ToastProvider /><Routes /></> ); }
 *
 * Usage anywhere in components:
 *   import { showToast } from '../shared/lib/toast';
 *
 *   showToast.success("Member added successfully!");
 *   showToast.error("Something went wrong. Please try again.");
 *   showToast.warning("This member's subscription is about to expire.");
 *   showToast.info("Changes saved as draft.");
 *
 * Options (optional second argument):
 *   showToast.success("Done!", { duration: 5000 });
 */

import { Toaster } from "react-hot-toast";

/* ─── Toast Provider ─── */
export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerStyle={{ top: 24, right: 24 }}
            toastOptions={{
                duration: 4000,
                style: {
                    padding: 0,
                    background: "transparent",
                    boxShadow: "none",
                    maxWidth: 380,
                },
            }}
        />
    );
}

/* ─── Toast Render Helpers ─── */
function ToastContent({ icon, bg, border, title, message, onDismiss }) {
    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-xl border-l-4 shadow-lg bg-white dark:bg-dark-card ${border}`}
            style={{ minWidth: 280, maxWidth: 380 }}
        >
            <span className={`mt-0.5 shrink-0 ${bg} text-white rounded-full p-1`}>
                {icon}
            </span>
            <div className="flex-1 min-w-0">
                {title && (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
                )}
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-snug">{message}</p>
            </div>
            <button
                onClick={onDismiss}
                className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors mt-0.5"
                aria-label="Dismiss notification"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
}

/* ─── Icons ─── */
const CheckIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);
const ErrorIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);
const WarnIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
);
const InfoIcon = () => (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

/* ─── showToast utility ─── */
export const showToast = {
    /**
     * Green success toast.
     * Use after: saving, creating, completing an action.
     */
    success(message, options = {}) {
        toast.custom(
            (t) => (
                <ToastContent
                    icon={<CheckIcon />}
                    bg="bg-green-500"
                    border="border-green-500"
                    message={message}
                    onDismiss={() => toast.dismiss(t.id)}
                />
            ),
            { duration: 4000, ...options }
        );
    },

    /**
     * Red error toast.
     * Use after: failed API calls, validation errors, unexpected failures.
     */
    error(message, options = {}) {
        toast.custom(
            (t) => (
                <ToastContent
                    icon={<ErrorIcon />}
                    bg="bg-red-500"
                    border="border-red-500"
                    message={message}
                    onDismiss={() => toast.dismiss(t.id)}
                />
            ),
            { duration: 5000, ...options }
        );
    },

    /**
     * Yellow warning toast.
     * Use for: non-blocking alerts, expiry notices, soft warnings.
     */
    warning(message, options = {}) {
        toast.custom(
            (t) => (
                <ToastContent
                    icon={<WarnIcon />}
                    bg="bg-yellow-500"
                    border="border-yellow-500"
                    message={message}
                    onDismiss={() => toast.dismiss(t.id)}
                />
            ),
            { duration: 4500, ...options }
        );
    },

    /**
     * Blue info toast.
     * Use for: neutral announcements, tips, status updates.
     */
    info(message, options = {}) {
        toast.custom(
            (t) => (
                <ToastContent
                    icon={<InfoIcon />}
                    bg="bg-brand-500"
                    border="border-brand-500"
                    message={message}
                    onDismiss={() => toast.dismiss(t.id)}
                />
            ),
            { duration: 4000, ...options }
        );
    },
};
