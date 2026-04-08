import React from "react";

/**
 * Avatar Component
 *
 * Shows a user's profile image. Falls back to colored initials circle.
 *
 * Sizes: xs | sm | md | lg | xl
 *
 * Props:
 *  - src       : image URL (optional)
 *  - name      : user's full name — used for initials fallback and alt text
 *  - size      : size preset (default: "md")
 *  - online    : show green online indicator dot
 *  - className : additional classes
 *
 * Example usage:
 *   <Avatar src={member.photo} name="Ali Hassan" size="lg" online />
 *   <Avatar name="Sara Ali" size="sm" />     ← initials fallback
 */

const sizes = {
    xs: { container: "w-6 h-6", text: "text-xs", dot: "w-1.5 h-1.5" },
    sm: { container: "w-8 h-8", text: "text-xs", dot: "w-2 h-2" },
    md: { container: "w-10 h-10", text: "text-sm", dot: "w-2.5 h-2.5" },
    lg: { container: "w-12 h-12", text: "text-base", dot: "w-3 h-3" },
    xl: { container: "w-16 h-16", text: "text-xl", dot: "w-3.5 h-3.5" },
};

// Generate a stable background color based on the name
function getColor(name = "") {
    const colors = [
        "bg-brand-500", "bg-purple-500", "bg-pink-500", "bg-green-500",
        "bg-teal-500", "bg-orange-500", "bg-red-500", "bg-indigo-500",
        "bg-yellow-500", "bg-cyan-500",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

function getInitials(name = "") {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ src, name = "", size = "md", online = false, className = "" }) {
    const s = sizes[size] ?? sizes.md;
    const initials = getInitials(name);
    const bgColor = getColor(name);

    return (
        <div className={`relative inline-flex shrink-0 ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={name || "Avatar"}
                    className={`${s.container} rounded-full object-cover ring-2 ring-white dark:ring-dark-card`}
                    onError={(e) => { e.target.style.display = "none"; }}
                />
            ) : (
                <span
                    className={`${s.container} ${bgColor} ${s.text} rounded-full flex items-center justify-center font-semibold text-white ring-2 ring-white dark:ring-dark-card`}
                    aria-label={name || "Avatar"}
                >
                    {initials || "?"}
                </span>
            )}

            {online && (
                <span
                    className={`absolute bottom-0 right-0 ${s.dot} rounded-full bg-green-500 ring-2 ring-white dark:ring-dark-card`}
                    aria-label="Online"
                />
            )}
        </div>
    );
}
