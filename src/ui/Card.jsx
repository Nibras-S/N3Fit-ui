import React from "react";
import { motion } from "framer-motion";

export function Card({
  children,
  className = "",
  hover = false,
  padding = true,
  ...props
}) {
  const base =
    "bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden font-sans";
  const pad = padding ? "p-4 md:p-5" : "";
  const hoverClass = hover
    ? "transition-shadow duration-200 hover:shadow-card-hover"
    : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`${base} ${pad} ${hoverClass} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({ children, className = "" }) {
  return (
    <div className={`text-lg font-semibold text-primary mb-3 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }) {
  return <div className={`text-gray-600 ${className}`}>{children}</div>;
}
