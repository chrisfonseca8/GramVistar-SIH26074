/**
 * Shared shell for a routed-but-not-yet-built page: honest about what's
 * coming rather than a blank screen. Used for portal
 * sub-pages whose navigation must work now but whose real
 * content is built later.
 */
export function PlaceholderPage({ eyebrow, title, description, comingInTask }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-foreground/50">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-foreground/60">
          {description}
        </p>
        {comingInTask ? (
          <p className="mt-2 text-xs text-foreground/40">
            Implemented in task {comingInTask}.
          </p>
        ) : null}
      </div>
    </main>
  );
}
