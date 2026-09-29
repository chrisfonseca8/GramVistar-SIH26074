import { RoleGate } from "@/components/auth/RoleGate";
import { PortalShell } from "@/components/layout/PortalShell";
import { governmentNavItems } from "./navItems";

export default function GovernmentLayout({ children }) {
  return (
    <RoleGate portal="government">
      <PortalShell portalTitle="Government" navItems={governmentNavItems}>
        {children}
      </PortalShell>
    </RoleGate>
  );
}
