const TONE_CLASSES = {
  info: "border-border text-foreground/70",
  warning:
    "border-yellow-300 bg-yellow-50 text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-950/30 dark:text-yellow-400",
  danger:
    "border-red-300 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400",
};

/**
 * Inline banner for a message that isn't a full-page error/empty state
 * (e.g. "SIMULATED" scenario banner, a validation warning).
 * `tone` maps loosely onto the shared risk palette (info≈green/none,
 * warning≈yellow/orange, danger≈red).
 */
export function Alert({ tone = "info", title, children }) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${TONE_CLASSES[tone]}`}
      role={tone === "danger" ? "alert" : "status"}
    >
      {title ? <p className="font-medium">{title}</p> : null}
      {children ? (
        <div className={title ? "mt-1" : undefined}>{children}</div>
      ) : null}
    </div>
  );
}
