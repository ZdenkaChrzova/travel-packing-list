import React from "react";
const variantClasses = {
  default: "bg-slate-900 text-white hover:bg-slate-800",
  outline:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "bg-transparent text-slate-700 hover:bg-slate-100",
  hero: "bg-white text-sky-700 hover:bg-sky-50",
};
const sizeClasses = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-lg px-3",
  icon: "h-10 w-10",
};
export function Button({
  className = "",
  variant = "default",
  size = "default",
  type = "button",
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-1 rounded-xl text-sm font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-sky-500 disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant] || variantClasses.default,
        sizeClasses[size] || sizeClasses.default,
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
