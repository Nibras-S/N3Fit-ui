import React from "react";

/**
 * Button Component
 *
 * Variants: primary | secondary | ghost | danger | success | outline
 * Sizes:    sm | md | lg | xl | icon-sm | icon-md | icon-lg
 *
 * Props:
 *  - variant     : button style (default: "primary")
 *  - size        : button size  (default: "md")
 *  - loading     : shows skeleton shimmer + disables button
 *  - leftIcon    : icon element shown left of label
 *  - rightIcon   : icon element shown right of label
 *  - fullWidth   : stretches button to full width
 *  - disabled    : disables the button
 *  - as          : render as a different element (e.g. "a")
 *  - className   : additional Tailwind classes
 *
 * Example usage:
 *   <Button variant="primary" size="md" leftIcon={<PlusIcon />}>
 *     Add Member
 *   </Button>
 *
 *   <Button variant="danger" loading>Deleting...</Button>
 */

const variants = {
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-700 focus:ring-zinc-900 shadow-sm dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 dark:active:bg-zinc-200 dark:focus:ring-white",
  secondary:
    "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 active:bg-gray-100 focus:ring-zinc-900 dark:bg-dark-card dark:text-gray-200 dark:border-dark-border dark:hover:bg-dark",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-400 dark:text-gray-300 dark:hover:bg-dark-card",
  danger:
    "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-500 shadow-sm",
  success:
    "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500 shadow-sm",
  outline:
    "bg-transparent text-gray-800 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 focus:ring-zinc-900 dark:text-gray-100 dark:border-dark-border dark:hover:bg-dark-card",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm font-medium rounded-lg gap-2",
  lg: "px-5 py-2.5 text-sm font-semibold rounded-xl gap-2",
  xl: "px-6 py-3 text-base font-semibold rounded-xl gap-2.5",
  "icon-sm": "p-1.5 rounded-lg",
  "icon-md": "p-2 rounded-lg",
  "icon-lg": "p-2.5 rounded-xl",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled = false,
  as: Component = "button",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-sans select-none";

  const classes = [
    base,
    variants[variant] ?? variants.primary,
    sizes[size] ?? sizes.md,
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (loading) {
    // Skeleton shimmer instead of spinner
    return (
      <div
        className={`${sizes[size] ?? sizes.md} ${fullWidth ? "w-full" : "w-auto"} inline-flex items-center justify-center rounded-lg bg-gray-200 dark:bg-dark-border animate-pulse min-w-[80px] h-9 ${className}`}
        aria-busy="true"
        aria-label="Loading…"
      />
    );
  }

  return (
    <Component
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </Component>
  );
}
