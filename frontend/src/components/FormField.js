import React from "react";

export default function FormField({ label, htmlFor, error, children, className = "" }) {
  return (
    <div className={`field mb-3 ${className}`.trim()}>
      {label ? (
        <label htmlFor={htmlFor} className="block font-medium mb-2 text-900">
          {label}
        </label>
      ) : null}
      {children}
      {error ? <small className="p-error block mt-1">{error}</small> : null}
    </div>
  );
}
