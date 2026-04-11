import React from "react";

/**
 * Defensive coercion: callers occasionally pass an axios error response
 * object as the `error` prop. The new API envelope is
 * `{ success: false, error: { code, message } }`, so an object can sneak in
 * and crash React with "Objects are not valid as a React child". This helper
 * always returns a renderable string.
 */
function coerceErrorMessage(error) {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    if (typeof error.message === "string") return error.message;
    if (typeof error.error === "string") return error.error;
    if (error.error && typeof error.error.message === "string") return error.error.message;
    try {
      return JSON.stringify(error);
    } catch (_) {
      return "Invalid input";
    }
  }
  return String(error);
}

export function Input({
  label,
  error,
  className = "",
  containerClassName = "",
  ...props
}) {
  const inputBase =
    "w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors font-sans";
  const errorClass = error ? "border-zinc-900 focus:ring-zinc-900/10" : "";
  const errorText = coerceErrorMessage(error);

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={`${inputBase} ${errorClass} ${className}`}
        {...props}
      />
      {errorText && (
        <p className="text-sm text-red-600">{errorText}</p>
      )}
    </div>
  );
}
