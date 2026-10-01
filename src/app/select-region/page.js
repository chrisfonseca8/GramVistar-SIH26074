"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useRegionStore } from "@/store/regionStore";
import { defaultPathForRole, REGION_GATED_ROLES } from "@/lib/auth/permissions";
import { Select } from "@/components/ui/Select";
import { JHARKHAND_DISTRICTS, BOKARO_BLOCKS } from "@/data/regions";

const PIPELINE_PILLS = [
  "Block-level weather",
  "Panchayat intelligence",
  "Advisory workflow",
];

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

  const canProceed = Boolean(selectedDistrict) && Boolean(selectedBlock);

  function handleConfirm() {
    if (!canProceed) return;
    confirmRegion();
    router.push(defaultPathForRole(role));
  }

  return (
    <main className="flex flex-1 items-center bg-[linear-gradient(135deg,#eef4ff_0%,#f8f9fa_45%,#eefcf4_100%)] px-6 py-16">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold tracking-[0.2em] text-[#2563eb] uppercase">
            Agro-Meteorological Advisory Platform
          </p>
          <h1 className="mt-4 font-[family-name:var(--font-inter)] text-5xl leading-[1.05] font-black tracking-tight text-[#111827] sm:text-6xl">
            Block-level forecasts,
            <br />
            turned into field-ready{" "}
            <span className="bg-linear-to-r from-[#2563eb] to-[#15803d] bg-clip-text text-transparent">
              decisions.
            </span>
          </h1>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-[#6b7280]">
            GramVistar turns block-level weather forecasts into
            panchayat-level diagnostics, crop decision support, and
            advisories — pick the district and block you work with to enter
            your {role} workspace.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-2.5 text-xs font-semibold tracking-wide text-[#374151]">
            {PIPELINE_PILLS.map((label, index) => (
              <span key={label} className="flex items-center gap-2.5">
                <span className="rounded-full border border-[#e5e7eb] bg-white px-3.5 py-2 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                  {label}
                </span>
                {index < PIPELINE_PILLS.length - 1 ? (
                  <span aria-hidden="true" className="text-[#9ca3af]">
                    &rarr;
                  </span>
                ) : null}
              </span>
            ))}
          </div>

          <div className="mt-11 flex gap-12">
            <div>
              <p className="text-3xl font-black tracking-tight text-[#111827] tabular-nums">
                5
              </p>
              <p className="mt-0.5 text-xs font-medium text-[#6b7280]">
                Panchayat boundaries mapped
              </p>
            </div>
            <div>
              <p className="text-3xl font-black tracking-tight text-[#111827] tabular-nums">
                10 yrs
              </p>
              <p className="mt-0.5 text-xs font-medium text-[#6b7280]">
                Historical weather record
              </p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white p-8 shadow-sm">
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-[#2563eb] to-[#15803d]"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-widest text-[#2563eb] uppercase">
              Region Input
            </span>
            <span className="rounded-full bg-[#eef2ff] px-3 py-1 text-[10px] font-semibold text-[#2563eb]">
              {role}
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-[#111827]">
            Select your district &amp; block
          </h2>
          <p className="mt-1 text-sm text-[#6b7280]">
            Choose one district and block to continue.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <RegionField number={1} label="District" required>
              <Select
                value={selectedDistrict ?? ""}
                onChange={(event) => setDistrict(event.target.value)}
                className="w-full"
                options={[
                  { value: "", label: "Select a district" },
                  ...JHARKHAND_DISTRICTS.map((district) => ({
                    value: district,
                    label: district,
                  })),
                ]}
              />
            </RegionField>

            <RegionField number={2} label="Block" required>
              <Select
                value={selectedBlock ?? ""}
                onChange={(event) => setBlock(event.target.value)}
                className="w-full"
                options={
                  selectedDistrict
                    ? [
                        { value: "", label: "Select a block" },
                        ...BOKARO_BLOCKS.map((block) => ({
                          value: block,
                          label: block,
                        })),
                      ]
                    : [{ value: "", label: "Select a district first" }]
                }
              />
            </RegionField>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canProceed}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#2563eb] to-[#0d9488] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue to {role}
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </div>
    </main>
  );
}

function RegionField({ number, label, required, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium text-[#1f2937]">
          <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#eef2ff] text-[10px] font-bold text-[#2563eb]">
            {number}
          </span>
          {label}
        </span>
        {required ? (
          <span className="text-[10px] font-medium tracking-wider text-[#6b7280] uppercase">
            Required
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
}
