"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { RoleBadge } from "@/components/layout/RoleBadge";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { PanchayatSelector } from "@/components/layout/PanchayatSelector";

/**
 * Shared top bar reused by every portal. Portal-specific
 * chrome (sidebar/nav items) lives in `PortalShell`, not here.
 */
export function Header({ portalTitle, onToggleMobileNav }) {
  const { t } = useTranslation();

  return (
    <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3">
      <button
        type="button"
        onClick={onToggleMobileNav}
        className="rounded-md border border-border p-2 text-sm sm:hidden"
        aria-label={t("common.toggleNav")}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 3h14M1 8h14M1 13h14"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <Link href="/" className="shrink-0 text-sm font-semibold">
        {t("common.appName")}
      </Link>

      {portalTitle ? (
        <span className="hidden text-sm text-foreground/50 sm:inline">
          / {portalTitle}
        </span>
      ) : null}

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:block">
          <PanchayatSelector />
        </div>
        <LanguageSwitch />
        <RoleBadge compact />
      </div>
    </header>
  );
}
