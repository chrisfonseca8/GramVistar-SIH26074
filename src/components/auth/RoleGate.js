"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore } from "@/store/auditStore";
import { useRegionStore } from "@/store/regionStore";
import { canAccessPortal, REGION_GATED_ROLES } from "@/lib/auth/permissions";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";

/**
 * Client-side route guard. Wrap a portal's layout with
 * `<RoleGate portal="scientist">{children}</RoleGate>` to block navigation
 * for roles that aren't permitted into that portal. This is a frontend
 * simulation, not real authorization.
 *
 * Waits for the auth store to finish reading localStorage before deciding
 * what to render, to avoid a logged-in user flashing an "access denied"
 * screen before their persisted role loads.
 */
export function RoleGate({ portal, children }) {
  const role = useAuthStore((state) => state.role);
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const regionConfirmed = useRegionStore((state) => state.confirmed);
  const regionHydrated = useRegionStore((state) => state.hasHydrated);
  const logEvent = useAuditStore((state) => state.logEvent);

  const hasHydrated = authHydrated && regionHydrated;
  const allowed = canAccessPortal(role, portal);
  const needsRegion = REGION_GATED_ROLES.includes(role) && !regionConfirmed;
  const deniedKey =
    hasHydrated && !allowed ? `${role ?? "guest"}:${portal}` : null;
  const loggedDeniedKeyRef = useRef(null);

  useEffect(() => {
    if (deniedKey && loggedDeniedKeyRef.current !== deniedKey) {
      loggedDeniedKeyRef.current = deniedKey;
      logEvent({ type: "access_denied", role, details: { portal } });
    }
  }, [deniedKey, logEvent, role, portal]);

  if (!hasHydrated) {
    return (
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <LoadingSkeleton className="h-4 w-40" />
      </main>
    );
  }

  if (!role) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-sm text-foreground/60">
          You need to log in to view this portal.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Log in
        </Link>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <ErrorState
          title="Access denied"
          description={`The "${role}" role cannot open this portal.`}
        />
        <Link
          href="/"
          className="text-sm font-medium underline underline-offset-4"
        >
          Back to home
        </Link>
      </main>
    );
  }

  if (needsRegion) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
        <p className="text-sm text-foreground/60">
          Select your district and block before entering this portal.
        </p>
        <Link
          href="/select-region"
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Select district & block
        </Link>
      </main>
    );
  }

  return children;
}
