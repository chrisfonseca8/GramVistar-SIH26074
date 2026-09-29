"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore } from "@/store/auditStore";

/**
 * Login/logout affordance driven by the mock auth store. Used both in the
 * shared portal header (`compact`) and on the home page (full).
 */
export function RoleBadge({ compact = false }) {
  const { t } = useTranslation();
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const logEvent = useAuditStore((state) => state.logEvent);

  if (!hasHydrated) return null;

  if (!role) {
    return (
      <Link
        href="/login"
        className={
          compact
            ? "rounded-full border border-border px-3 py-1.5 text-xs font-medium transition hover:border-border-hover "
            : "rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        }
      >
        {compact ? t("common.login") : t("common.launchPortal")}
      </Link>
    );
  }

  function handleLogout() {
    logEvent({ type: "logout", role });
    logout();
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-border px-3 py-1.5 text-xs font-medium ">
          {role}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className="text-xs font-medium text-foreground/60 underline underline-offset-4 hover:text-foreground"
        >
          {t("common.logout")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground/70">
        {t("common.loggedInAs", { role })}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-border-hover "
      >
        {t("common.logout")}
      </button>
    </div>
  );
}
