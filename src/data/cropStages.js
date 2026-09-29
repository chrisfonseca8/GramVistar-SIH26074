/**
 * Generic crop growth stages for the Advisory Studio's crop-stage
 * selector. Unlike weather variables, crop stage is
 * observed in the field by the scientist/farmer, not something the app
 * can derive from `/data` — this is a fixed reference list for the
 * selector, not a data source.
 */
export const CROP_STAGE_OPTIONS = [
  "Sowing",
  "Vegetative",
  "Flowering",
  "Maturity",
  "Harvest",
];
