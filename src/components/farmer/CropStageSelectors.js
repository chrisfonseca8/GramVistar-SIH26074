"use client";

import { useTranslation } from "react-i18next";
import { Select } from "@/components/ui/Select";
import { useFarmerStore } from "@/store/farmerStore";
import { DEFAULT_CROP_THRESHOLDS } from "@/data/cropThresholds";
import { CROP_STAGE_OPTIONS } from "@/data/cropStages";

/**
 * Crop + crop-stage selectors, backed by the persisted
 * `farmerStore`. Crop options come from
 * `DEFAULT_CROP_THRESHOLDS` — the same crop list the Scientist portal's
 * Advisory Studio and Crop Threshold Editor use — rather than a
 * second, separately-maintained crop list.
 */
export function CropStageSelectors() {
  const { t } = useTranslation();
  const selectedCrop = useFarmerStore((state) => state.selectedCrop);
  const setSelectedCrop = useFarmerStore((state) => state.setSelectedCrop);
  const selectedCropStage = useFarmerStore((state) => state.selectedCropStage);
  const setSelectedCropStage = useFarmerStore(
    (state) => state.setSelectedCropStage,
  );

  return (
    <div className="flex flex-wrap gap-3">
      <Select
        label={t("farmer.cropLabel")}
        value={selectedCrop ?? ""}
        onChange={(event) => setSelectedCrop(event.target.value || null)}
        options={[
          { value: "", label: t("farmer.selectCrop") },
          ...DEFAULT_CROP_THRESHOLDS.map((entry) => ({
            value: entry.crop,
            label: entry.crop,
          })),
        ]}
      />
      <Select
        label={t("farmer.cropStageLabel")}
        value={selectedCropStage ?? ""}
        onChange={(event) => setSelectedCropStage(event.target.value || null)}
        options={[
          { value: "", label: t("farmer.selectCropStage") },
          ...CROP_STAGE_OPTIONS.map((stage) => ({
            value: stage,
            label: stage,
          })),
        ]}
      />
    </div>
  );
}
