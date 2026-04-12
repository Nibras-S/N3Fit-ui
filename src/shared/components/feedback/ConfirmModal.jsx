import React from "react";
import { Modal } from "../ui/Modal";

/**
 * ConfirmModal Component
 *
 * A clear, user-friendly confirmation dialog built on top of <Modal />.
 * Supports four intent types: danger, warning, info, success.
 *
 * Props:
 *  - isOpen      : controls visibility
 *  - onClose     : called when the modal should close (X or Cancel)
 *  - onConfirm   : called when the user clicks the confirm button
 *  - title       : dialog heading  (default: "Are you sure?")
 *  - message     : body message — keep it short and clear
 *  - confirmText : confirm button label  (default: "Confirm")
 *  - cancelText  : cancel button label   (default: "Cancel")
 *  - type        : "danger" | "warning" | "info" | "success"  (default: "danger")
 *  - loading     : shows skeleton on confirm button while async action runs
 *
 * Example usage:
 *   <ConfirmModal
 *     isOpen={showDeleteModal}
 *     onClose={() => setShowDeleteModal(false)}
 *     onConfirm={handleDelete}
 *     title="Delete Member"
 *     message="This will permanently delete the member and all their data. This action cannot be undone."
 *     confirmText="Yes, Delete"
 *     type="danger"
 *   />
 */

const config = {
    danger: {
        iconBg: "bg-zinc-100 dark:bg-zinc-700/50",
        iconColor: "text-red-600 dark:text-red-400",
        btnClass: "bg-zinc-900 hover:bg-zinc-800 focus:ring-red-500 text-white",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
        ),
    },
    warning: {
        iconBg: "bg-yellow-100 dark:bg-yellow-900/30",
        iconColor: "text-yellow-600 dark:text-yellow-400",
        btnClass: "bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400 text-white",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374l7.302-12.748c.866-1.5 3.032-1.5 3.898 0l7.303 12.748zM12 15.75h.007v.008H12v-.008z" />
            </svg>
        ),
    },
    info: {
        iconBg: "bg-zinc-100 dark:bg-zinc-800/50",
        iconColor: "text-zinc-900 dark:text-white",
        btnClass: "bg-zinc-900 hover:bg-zinc-800 focus:ring-zinc-900 text-white",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            </svg>
        ),
    },
    success: {
        iconBg: "bg-green-100 dark:bg-green-900/30",
        iconColor: "text-green-600 dark:text-green-400",
        btnClass: "bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white",
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
};

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "Please confirm that you want to proceed with this action.",
    confirmText = "Confirm",
    cancelText = "Cancel",
    type = "danger",
    loading = false,
}) => {
    const c = config[type] ?? config.danger;

    const footer = (
        <>
            <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
            >
                {cancelText}
            </button>

            {loading ? (
                /* Skeleton shimmer on confirm button while loading */
                <div className="h-9 w-28 rounded-lg bg-gray-200 dark:bg-dark-border animate-pulse" aria-busy="true" />
            ) : (
                <button
                    onClick={() => { onConfirm?.(); onClose?.(); }}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 ${c.btnClass}`}
                >
                    {confirmText}
                </button>
            )}
        </>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" hideHeader footer={footer}>
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`p-3 rounded-full shrink-0 ${c.iconBg} ${c.iconColor}`}>
                    {c.icon}
                </div>

                {/* Text */}
                <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {message}
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default ConfirmModal;
