"use client";

import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/Select";
import { useFarmerStore } from "@/store/farmerStore";
import { DEFAULT_CROP_THRESHOLDS } from "@/data/cropThresholds";

/**
 * Crop selector, backed by the persisted `farmerStore`. Crop options come
 * from `DEFAULT_CROP_THRESHOLDS` — the same crop list the Scientist
 * portal's Advisory Studio uses — rather than a second,
 * separately-maintained crop list.
 */
export function CropSelector() {
  const { t } = useTranslation();
  const selectedCrop = useFarmerStore((state) => state.selectedCrop);
  const setSelectedCrop = useFarmerStore((state) => state.setSelectedCrop);

  return (
    <Select
      label={t("farmer.cropLabel")}
      value={selectedCrop ?? ""}
      onChange={(event) => setSelectedCrop(event.target.value || null)}
      options={[
        { value: "", label: t("farmer.selectCrop") },
        ...DEFAULT_CROP_THRESHOLDS.map((entry) => ({
          value: entry.crop,
          label: t(`farmer.crops.${entry.crop}`, entry.crop),
        })),
      ]}
    />
  );
}
