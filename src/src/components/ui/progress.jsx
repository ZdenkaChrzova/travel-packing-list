import React from "react";
export function Progress({ value = 0, className = "", ...props }) {
  const normalizedValue = Math.min(100, Math.max(0, Number(value) || 0));
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={normalizedValue}
      className={`relative h-2 w-full overflow-hidden rounded-full bg-slate-200 ${className}`}
      {...props}
    >
      <div
        className="h-full bg-sky-600 transition-all duration-300"
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  );
}
