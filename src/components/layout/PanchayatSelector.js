"use client";

import { useTranslation } from "react-i18next";
import { useDataStore } from "@/store/dataStore";
import { useSelectionStore } from "@/store/selectionStore";

const BLOCK_VALUE = "__block__";

/**
 * Global panchayat selector — "Chas Block" (the block-level aggregate,
 * represented as `null`) plus every panchayat from the loaded borders
 * GeoJSON (never a hardcoded list, so it can't drift from the real data).
 */
export function PanchayatSelector() {
  const { t } = useTranslation();
  const status = useDataStore((state) => state.status);
  const panchayats = useDataStore((state) => state.data?.panchayats ?? []);
  const selected = useSelectionStore((state) => state.selectedPanchayat);
  const setSelected = useSelectionStore((state) => state.setSelectedPanchayat);

  if (status !== "ready") {
    return (
      <select
        disabled
        className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground/40 "
      >
        <option>
          {status === "error"
            ? t("common.panchayatsUnavailable")
            : t("common.loadingPanchayats")}
        </option>
      </select>
    );
  }

  return (
    <select
      value={selected ?? BLOCK_VALUE}
      onChange={(event) => {
        const value = event.target.value;
        setSelected(value === BLOCK_VALUE ? null : value);
      }}
      className="cursor-pointer rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
      aria-label={t("common.selectedPanchayat")}
    >
      <option value={BLOCK_VALUE}>{t("common.chasBlock")}</option>
      {panchayats.map((panchayat) => (
        <option key={panchayat} value={panchayat}>
          {panchayat}
        </option>
      ))}
    </select>
  );
}
