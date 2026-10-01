"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";
import { PanchayatSelector } from "@/components/layout/PanchayatSelector";

/**
 * Mobile nav drawer — same `navItems` as `Sidebar`, plus the panchayat
 * selector (which the header hides below `sm` to save space).
 */
export function MobileNav({ navItems, open, onClose }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 sm:hidden">
      <button
        type="button"
        aria-label={t("common.closeNav")}
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <nav className="absolute inset-y-0 left-0 flex w-64 flex-col gap-4 bg-nav-background p-4 text-nav-foreground shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-nav-foreground">
            {t("common.menu")}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("common.close")}
            className="rounded-md border border-white/30 p-1.5 text-nav-foreground"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <PanchayatSelector />

        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`rounded-md px-3 py-2 text-sm font-medium text-nav-foreground transition ${
                  active ? "bg-white/10" : "hover:bg-white/5"
                }`}
              >
                {t(item.labelKey, item.label)}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
