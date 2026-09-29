"use client";

import { useDataStore } from "@/store/dataStore";
import { useAdvisoryStore } from "@/store/advisoryStore";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  selectAllPublishedAdvisories,
  getLatestVersionContent,
  getLatestVersionTimestamp,
} from "@/data/selectors/publishedAdvisories";
import { formatHourLabel } from "@/lib/formatters";

export default function GovernmentPortalPage() {
  const status = useDataStore((state) => state.status);
  const error = useDataStore((state) => state.error);
  const advisories = useAdvisoryStore((state) => state.advisories);

  if (status === "idle" || status === "loading") {
    return (
      <main className="flex-1 px-6 py-8">
        <LoadingSkeleton lines={6} />
      </main>
    );
  }

  if (status === "error") {
    return (
      <main className="flex-1 px-6 py-8">
        <ErrorState title="Failed to load local data" description={error} />
      </main>
    );
  }

  const published = selectAllPublishedAdvisories(advisories);

  return (
    <main className="flex-1 space-y-6 px-6 py-8">
      <div>
        <h1 className="text-xl font-semibold">Published Advisories</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Every panchayat-level operational advisory the Scientist / KVK
          portal has published — irrigation/water, hazards and alerts, not
          tied to any one crop. The Farmer portal gets its own,
          separately-reviewed crop-specific advisory. Risk maps and
          disaster-management modules are covered elsewhere in the
          Government portal.
        </p>
      </div>

      {published.length === 0 ? (
        <EmptyState
          title="No advisories published yet"
          description="Nothing has been published from the Advisory Studio yet — this list updates as soon as one is."
        />
      ) : (
        <div className="space-y-3">
          {published.map((advisory) => {
            const content = getLatestVersionContent(advisory);
            return (
              <section
                key={advisory.id}
                className="rounded-lg border border-border p-4 "
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{advisory.panchayat}</p>
                  <p className="text-xs text-foreground/50">
                    Published{" "}
                    {formatHourLabel(
                      new Date(getLatestVersionTimestamp(advisory)),
                    )}
                  </p>
                </div>
                <p className="mt-2 text-sm text-foreground/70">
                  {content.summary}
                </p>
                <p className="mt-2 text-xs text-foreground/50">
                  {content.actions.length} action(s) · confidence:{" "}
                  {content.confidence}
                </p>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
