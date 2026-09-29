/**
 * The one "bordered section with an optional title" implementation every
 * portal should use. Several pages previously defined their
 * own local `Section`/`MetricCard`-style component with identical markup
 * (`rounded-lg border border-border p-5 `) — this
 * replaces those page-specific copies.
 */
export function Card({ title, description, className = "", children }) {
  return (
    <section
      className={`rounded-lg border border-border bg-surface p-5 shadow-sm ${className}`}
    >
      {title ? <h2 className="text-sm font-semibold">{title}</h2> : null}
      {description ? (
        <p className="mt-1 text-xs text-foreground/50">{description}</p>
      ) : null}
      <div className={title || description ? "mt-4" : undefined}>
        {children}
      </div>
    </section>
  );
}
