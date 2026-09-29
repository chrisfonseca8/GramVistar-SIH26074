/**
 * Default crop heat/cold stress thresholds.
 *
 * These are **starting defaults**, not sourced from any file in `/data`
 * — no crop-threshold dataset exists there. The values are commonly-cited
 * general ranges for these crops (Rice, Maize, Mustard are the crops
 * named in the project's own original design notes for this block), not
 * measurements or a verified agronomic standard for Chas Block
 * specifically — treat them as illustrative/adjustable rather than
 * authoritative. `thresholdStore`'s overrides can replace them per crop.
 */
export const DEFAULT_CROP_THRESHOLDS = [
  { crop: "Rice", heatStressC: 35, coldStressC: 15, baseTempC: 10 },
  { crop: "Maize", heatStressC: 38, coldStressC: 10, baseTempC: 10 },
  { crop: "Mustard", heatStressC: 32, coldStressC: 5, baseTempC: 5 },
];
