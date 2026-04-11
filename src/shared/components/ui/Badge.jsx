import React from "react";

/**
 * Badge Component
 *
 * Variants: brand | success | warning | error | gray | blue | purple | orange
 * Sizes:    sm | md | lg
 *
 * Props:
 *  - variant   : color theme (default: "gray")
 *  - size      : size (default: "md")
 *  - dot       : show a colored dot indicator before the label
 *  - className : additional Tailwind classes
 *
 * Example usage:
 *   <Badge variant="success">Active</Badge>
 *   <Badge variant="error" dot>Expired</Badge>
 *   <Badge variant="warning" size="lg">Pending</Badge>
 */

const variants = {
  brand: "bg-rose-50    text-rose-700    ring-rose-700/10   dark:bg-rose-900/20   dark:text-rose-300",
  success: "bg-green-50  text-green-700  ring-green-700/10  dark:bg-green-900/30  dark:text-green-300",
  warning: "bg-yellow-50 text-yellow-700 ring-yellow-700/10 dark:bg-yellow-900/30 dark:text-yellow-300",
  error: "bg-red-50     text-red-700    ring-red-700/10    dark:bg-red-900/30    dark:text-red-300",
  gray: "bg-gray-100  text-gray-600   ring-gray-500/10   dark:bg-dark-border   dark:text-gray-300",
  blue: "bg-gray-100  text-gray-700   ring-gray-500/10   dark:bg-gray-700/50   dark:text-gray-300",
  purple: "bg-purple-50 text-purple-700 ring-purple-700/10 dark:bg-purple-900/30 dark:text-purple-300",
  orange: "bg-orange-50 text-orange-700 ring-orange-700/10 dark:bg-orange-900/30 dark:text-orange-300",
};

const dotColors = {
  brand: "bg-rose-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  error: "bg-red-500",
  gray: "bg-gray-400",
  blue: "bg-gray-500",
  purple: "bg-purple-500",
  orange: "bg-orange-500",
};

const sizes = {
  sm: "px-1.5 py-0.5 text-xs gap-1",
  md: "px-2 py-1 text-xs gap-1.5",
  lg: "px-2.5 py-1 text-sm gap-1.5",
};

export function Badge({
  children,
  variant = "gray",
  size = "md",
  dot = false,
  className = "",
}) {
  const base =
    "inline-flex items-center font-medium rounded-full ring-1 ring-inset whitespace-nowrap";

  const classes = [
    base,
    variants[variant] ?? variants.gray,
    sizes[size] ?? sizes.md,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={classes}>
      {dot && (
        <span
          className={`inline-block rounded-full shrink-0 ${dotColors[variant] ?? dotColors.gray} ${size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5"}`}
        />
      )}
      {children}
    </span>
  );
}
