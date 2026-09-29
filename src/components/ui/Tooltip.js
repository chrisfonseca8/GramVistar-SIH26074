"use client";

import { useId } from "react";

/**
 * Minimal hover/focus tooltip. Shown on both `:hover` and
 * `:focus` (via Tailwind's `group-focus-within`) so it's reachable by
 * keyboard, not just a mouse.
 */
export function Tooltip({ label, children }) {
  const id = useId();

  return (
    <span className="group/tooltip relative inline-flex focus-within:outline-none">
      <span tabIndex={0} aria-describedby={id} className="inline-flex">
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 w-max max-w-xs -translate-x-1/2 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground opacity-0 transition group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      >
        {label}
      </span>
    </span>
  );
}
