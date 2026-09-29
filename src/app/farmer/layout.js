import { RoleGate } from "@/components/auth/RoleGate";
import { PortalShell } from "@/components/layout/PortalShell";
import { farmerNavItems } from "./navItems";

export default function FarmerLayout({ children }) {
  return (
    <RoleGate portal="farmer">
      <PortalShell portalTitle="Farmer" navItems={farmerNavItems}>
        {children}
      </PortalShell>
    </RoleGate>
  );
}
