"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Alert } from "@/components/ui/Alert";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

/**
 * The shared application shell every portal is built inside of:
 * header, desktop sidebar, mobile nav drawer and breadcrumbs, wired
 * to a portal's own `navItems`. Only rendered once `RoleGate` has already
 * confirmed the current role may see this portal.
 *
 * Also shows a shared offline banner when the browser reports it's
 * offline — a consistent signal across all 3 portals, not just the
 * Farmer portal (which already had its own advisory-specific
 * offline-cache handling). Renders nothing extra when online (the
 * normal case), so this is purely additive and can't change any
 * existing page's behavior.
 */
export function PortalShell({ portalTitle, navItems, children }) {
  const { t } = useTranslation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const online = useOnlineStatus();

  return (
    <div className="flex flex-1 flex-col">
      <div className="print-hide">
        <Header
          portalTitle={portalTitle}
          onToggleMobileNav={() => setMobileNavOpen(true)}
        />
      </div>
      {!online ? (
        <div className="print-hide px-4 pt-3">
          <Alert tone="warning">{t("common.offline")}</Alert>
        </div>
      ) : null}
      <div className="print-hide">
        <MobileNav
          navItems={navItems}
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
        />
      </div>

      <div className="flex flex-1">
        <div className="print-hide">
          <Sidebar navItems={navItems} />
        </div>
        <div className="flex flex-1 flex-col">
          <div className="print-hide">
            <Breadcrumbs />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
