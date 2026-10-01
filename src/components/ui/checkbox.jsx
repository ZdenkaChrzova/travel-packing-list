import React from "react";
import { Check } from "lucide-react";
export function Checkbox({
  checked = false,
  onCheckedChange,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={Boolean(checked)}
      onClick={() => onCheckedChange?.(!checked)}
      className={[
        "flex h-5 w-5 shrink-0 items-center justify-center rounded",
        "border transition-colors focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-sky-500",
        checked
          ? "border-sky-600 bg-sky-600 text-white"
          : "border-slate-300 bg-white text-transparent",
        className,
      ].join(" ")}
      {...props}
    >
      <Check className="h-3.5 w-3.5" strokeWidth={3} />
    </button>
  );
}
