"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useAuditStore } from "@/store/auditStore";

/**
 * Login/logout affordance driven by the mock auth store. Used both in the
 * shared portal header (`compact`) and on the home page (full).
 */
export function RoleBadge({ compact = false, variant = "default" }) {
  const { t } = useTranslation();
  const role = useAuthStore((state) => state.role);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const logEvent = useAuditStore((state) => state.logEvent);

  if (!hasHydrated) return null;

  const isLanding = variant === "landing";

  if (!role) {
    const landingClasses = compact
      ? "rounded-full bg-[#15803d] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#166534]"
      : "rounded-full bg-[#15803d] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#166534]";
    const defaultClasses = compact
      ? "rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium text-nav-foreground transition hover:bg-white/10"
      : "rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90";
    return (
      <Link href="/login" className={isLanding ? landingClasses : defaultClasses}>
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
        <span
          className={
            isLanding
              ? "rounded-full border border-[#e5e7eb] px-3 py-1.5 text-xs font-medium text-[#111827]"
              : "rounded-full border border-white/30 px-3 py-1.5 text-xs font-medium text-nav-foreground"
          }
        >
          {role}
        </span>
        <button
          type="button"
          onClick={handleLogout}
          className={
            isLanding
              ? "text-xs font-medium text-[#374151] underline underline-offset-4 hover:text-[#111827]"
              : "text-xs font-medium text-nav-foreground underline underline-offset-4 hover:opacity-80"
          }
        >
          {t("common.logout")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span
        className={
          isLanding ? "text-sm text-[#374151]" : "text-sm text-foreground/70"
        }
      >
        {t("common.loggedInAs", { role })}
      </span>
      <button
        type="button"
        onClick={handleLogout}
        className={
          isLanding
            ? "rounded-full border border-[#e5e7eb] px-4 py-2 text-sm font-medium text-[#111827] transition hover:border-[#166534]"
            : "rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:border-border-hover "
        }
      >
        {t("common.logout")}
      </button>
    </div>
  );
}
