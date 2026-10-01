/**
 * Thin styling wrapper around the plain `<table>` markup nearly every data
 * table in the app already used (`w-full text-left text-sm`, uppercase
 * muted header row, hairline row dividers). Callers keep full control of
 * columns/cell content — this only centralizes the repeated classNames so
 * a future table doesn't retype them.
 *
 * Wrapped in a horizontally-scrolling container so a table with more columns than fit a phone
 * screen scrolls instead of overflowing/clipping — every consumer of this
 * shared primitive gets that for free, not just the ones that remembered
 * to add their own `overflow-x-auto`.
 */
export function Table({ className = "", children }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full text-left text-sm ${className}`}>
        {children}
      </table>
    </div>
  );
}

export function TableHeadRow({ children }) {
  return (
    <tr className="border-b border-border text-xs font-medium tracking-wider text-text-muted uppercase ">
      {children}
    </tr>
  );
}

export function TableRow({ children }) {
  return <tr className="border-b border-border ">{children}</tr>;
}

export function TableCell({ as: Tag = "td", className = "", children }) {
  return <Tag className={`py-2 pr-4 ${className}`}>{children}</Tag>;
}
