import React from "react";

export function Input({
  label,
  error,
  className = "",
  containerClassName = "",
  ...props
}) {
  const inputBase =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-sans";
  const errorClass = error ? "border-red-500 focus:ring-red-500/20" : "";

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={`${inputBase} ${errorClass} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
