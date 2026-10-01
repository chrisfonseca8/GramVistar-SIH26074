"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

/**
 * Desktop-only portal navigation. `navItems` is supplied per portal (each
 * portal owns its own nav list; this component just renders it), so the
 * list can grow as new pages are added without touching this component.
 */
export function Sidebar({ navItems }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav className="hidden w-56 shrink-0 flex-col gap-1 overflow-y-auto bg-nav-background p-4 sm:flex">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-md px-3 py-2 text-sm font-medium text-nav-foreground transition ${
              active ? "bg-white/10" : "hover:bg-white/5"
            }`}
          >
            {t(item.labelKey, item.label)}
          </Link>
        );
      })}
    </nav>
  );
}
