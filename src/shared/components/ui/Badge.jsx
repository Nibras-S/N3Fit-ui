import React from "react";

const variants = {
  default: "bg-gray-100 text-gray-800",
  success: "bg-emerald-100 text-emerald-800",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-red-100 text-red-800",
  info: "bg-blue-100 text-blue-800",
};

export function Badge({ children, variant = "default", className = "" }) {
  const base =
    "inline-flex items-center justify-center px-2.5 py-0.5 text-xs font-medium rounded-full";
  return (
    <span
      className={`${base} ${variants[variant] || variants.default} ${className}`}
    >
      {children}
    </span>
  );
}
