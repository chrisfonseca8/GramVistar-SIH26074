"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "react-i18next";

const KNOWN_LABEL_KEYS = {
  scientist: "breadcrumb.scientist",
  farmer: "breadcrumb.farmer",
  government: "breadcrumb.government",
  login: "breadcrumb.login",
};

function fallbackLabel(segment) {
  return segment
    .replace(/[-_]/g, "")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Generic breadcrumb trail computed from the current pathname. */
export function Breadcrumbs() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((segment, index) => ({
    href: "/" + segments.slice(0, index + 1).join("/"),
    label: KNOWN_LABEL_KEYS[segment]
      ? t(KNOWN_LABEL_KEYS[segment])
      : fallbackLabel(segment),
    isLast: index === segments.length - 1,
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      className="border-b border-border bg-white px-4 py-2 text-xs text-text-muted"
    >
      <ol className="flex flex-wrap items-center gap-1">
        <li>
          <Link href="/" className="hover:text-primary hover:underline">
            {t("common.home")}
          </Link>
        </li>
        {crumbs.map((crumb) => (
          <li key={crumb.href} className="flex items-center gap-1">
            <span aria-hidden="true">/</span>
            {crumb.isLast ? (
              <span className="font-medium text-foreground">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="hover:text-primary hover:underline"
              >
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
