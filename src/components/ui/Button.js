const VARIANT_CLASSES = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "border border-border hover:border-border-hover ",
  ghost: "text-foreground/70 hover:text-foreground",
  danger:
    "border border-red-300 text-red-700 hover:border-red-500 dark:border-red-900/60 dark:text-red-400",
};

const SIZE_CLASSES = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-1.5 text-sm",
};

/**
 * The one button implementation every portal should use.
 * Wraps a native `<button>` so keyboard/focus/disabled behavior is free —
 * never build a clickable `div`/`span` in place of this.
 */
export function Button({
  variant = "secondary",
  size = "md",
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      className={`rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    />
  );
}
