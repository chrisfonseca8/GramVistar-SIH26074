import { RoleGate } from "@/components/auth/RoleGate";
import { PortalShell } from "@/components/layout/PortalShell";
import { scientistNavItems } from "./navItems";

export default function ScientistLayout({ children }) {
  return (
    <RoleGate portal="scientist">
      <PortalShell portalTitle="Scientist / KVK" navItems={scientistNavItems}>
        {children}
      </PortalShell>
    </RoleGate>
  );
}
