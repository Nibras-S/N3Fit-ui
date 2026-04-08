import React, { useEffect } from "react";

/**
 * Modal Component
 *
 * A generic, accessible modal dialog.
 *
 * Props:
 *  - isOpen      : controls visibility
 *  - onClose     : called when modal should close
 *  - title       : modal heading (string)
 *  - description : optional subtitle text
 *  - size        : "sm" | "md" | "lg" | "xl" | "full"   (default: "md")
 *  - children    : modal body content
 *  - footer      : optional footer element (e.g. action buttons)
 *  - hideHeader  : hides the title/description header
 *
 * Example usage:
 *   <Modal isOpen={open} onClose={() => setOpen(false)} title="Edit Member">
 *     <p>Modal body goes here</p>
 *     <div slot="footer">
 *       <Button onClick={() => setOpen(false)}>Save</Button>
 *     </div>
 *   </Modal>
 */

const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-full mx-4",
};

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    size = "md",
    children,
    footer,
    hideHeader = false,
}) {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => { if (e.key === "Escape") onClose?.(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={title}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div
                className={`relative w-full ${sizeClasses[size] ?? sizeClasses.md} bg-white dark:bg-dark-card rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-border overflow-hidden flex flex-col max-h-[90vh] animate-fade-in`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                {!hideHeader && (
                    <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100 dark:border-dark-border">
                        <div>
                            {title && (
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    {title}
                                </h2>
                            )}
                            {description && (
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {description}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={onClose}
                            className="ml-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark dark:hover:text-gray-200 transition-colors"
                            aria-label="Close modal"
                        >
                            {/* X icon */}
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark flex items-center justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
