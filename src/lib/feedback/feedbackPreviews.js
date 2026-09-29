/**
 * Preview-only delivery-channel formatters for a farmer feedback
 * submission — same simulation discipline as
 * `src/lib/advisory/deliveryPreviews.js`: no SMS/IVR is ever
 * actually sent, this only shows what a real confirmation message would
 * look like.
 */

const CATEGORY_LABELS = {
  cropStage: "Crop Stage",
  irrigation: "Irrigation",
  pest: "Pest",
  damage: "Damage",
  yield: "Yield",
};

/** @param {object} entry a stored feedback entry from `feedbackStore` */
export function formatFeedbackSmsPreview(entry) {
  const categoryLabel = CATEGORY_LABELS[entry.category] ?? entry.category;
  return `[Chas KVK] Thank you. Your ${categoryLabel} feedback for ${entry.panchayat} was received. Ref: ${entry.id.slice(0, 8)}`;
}

/** @param {object} entry a stored feedback entry from `feedbackStore` */
export function formatFeedbackIvrScript(entry) {
  const categoryLabel = CATEGORY_LABELS[entry.category] ?? entry.category;
  return [
    `Namaste. Thank you for submitting ${categoryLabel} feedback for ${entry.panchayat} panchayat.`,
    "Your local Krishi Vigyan Kendra will review it.",
    `Your reference number is ${entry.id.slice(0, 8)}.`,
    "To end this call, press two.",
  ].join(" ");
}
