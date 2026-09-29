"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRegionStore } from "@/store/regionStore";
import { defaultPathForRole, REGION_GATED_ROLES } from "@/lib/auth/permissions";
import { Select } from "@/components/ui/Select";
import { Alert } from "@/components/ui/Alert";
import {
  JHARKHAND_DISTRICTS,
  DISTRICT_WITH_DATA,
  BOKARO_BLOCKS,
  BLOCK_WITH_DATA,
} from "@/data/regions";

export default function SelectRegionPage() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const authHydrated = useAuthStore((state) => state.hasHydrated);
  const selectedDistrict = useRegionStore((state) => state.selectedDistrict);
  const selectedBlock = useRegionStore((state) => state.selectedBlock);
  const regionHydrated = useRegionStore((state) => state.hasHydrated);
  const setDistrict = useRegionStore((state) => state.setDistrict);
  const setBlock = useRegionStore((state) => state.setBlock);
  const confirmRegion = useRegionStore((state) => state.confirmRegion);

  const hasHydrated = authHydrated && regionHydrated;

  useEffect(() => {
    if (!hasHydrated) return;
    if (!role) {
      router.replace("/login");
      return;
    }
    if (!REGION_GATED_ROLES.includes(role)) {
      router.replace(defaultPathForRole(role));
    }
  }, [hasHydrated, role, router]);

  if (!hasHydrated || !role || !REGION_GATED_ROLES.includes(role)) {
    return null;
  }

  const districtHasData = selectedDistrict === DISTRICT_WITH_DATA;
  const blockHasData = selectedBlock === BLOCK_WITH_DATA;
  const canProceed = districtHasData && blockHasData;

  function handleConfirm() {
    if (!canProceed) return;
    confirmRegion();
    router.push(defaultPathForRole(role));
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="text-center">
          <span className="rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground/50">
            {role}
          </span>
          <h1 className="mt-3 text-xl font-semibold">
            Select your district and block
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            Choose the district and block you work with. This app currently
            has data for Chas Block, Bokaro District only.
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <Select
            label="District"
            value={selectedDistrict ?? ""}
            onChange={(event) => setDistrict(event.target.value)}
            options={[
              { value: "", label: "Select a district" },
              ...JHARKHAND_DISTRICTS.map((district) => ({
                value: district,
                label: district,
              })),
            ]}
          />

          {selectedDistrict && !districtHasData ? (
            <Alert tone="warning">
              No data is available for {selectedDistrict} in this
              environment. Select Bokaro to continue.
            </Alert>
          ) : null}

          {districtHasData ? (
            <Select
              label="Block"
              value={selectedBlock ?? ""}
              onChange={(event) => setBlock(event.target.value)}
              options={[
                { value: "", label: "Select a block" },
                ...BOKARO_BLOCKS.map((block) => ({
                  value: block,
                  label: block,
                })),
              ]}
            />
          ) : null}

          {selectedBlock && !blockHasData ? (
            <Alert tone="warning">
              No data is available for {selectedBlock} block in this
              environment. Select Chas to continue.
            </Alert>
          ) : null}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!canProceed}
          className="mt-6 w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continue to {role}
        </button>
      </div>
    </main>
  );
}
