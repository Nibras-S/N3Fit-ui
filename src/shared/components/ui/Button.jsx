import React from "react";
import { motion } from "framer-motion";

const variants = {
  primary:
    "bg-primary text-white shadow-soft hover:bg-primary-light active:scale-[0.98]",
  secondary:
    "bg-surface-muted text-primary border border-gray-200 hover:bg-gray-100 active:scale-[0.98]",
  accent:
    "bg-accent text-white shadow-soft hover:opacity-90 active:scale-[0.98]",
  danger: "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]",
  ghost: "bg-transparent hover:bg-black/5 active:scale-[0.98]",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg",
  md: "px-4 py-2 text-sm font-medium rounded-lg",
  lg: "px-6 py-3 text-base font-medium rounded-xl",
  icon: "p-2 rounded-lg",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  as: Component = "button",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none font-sans";
  const classes = `${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`;

  return (
    <motion.div whileTap={{ scale: 0.98 }}>
      <Component className={classes} {...props}>
        {children}
      </Component>
    </motion.div>
  );
}
