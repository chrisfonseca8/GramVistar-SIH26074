/**
 * Preview-only delivery-channel formatters. These are
 * **simulations** — no message is ever actually sent over SMS/IVR/
 * WhatsApp, and no bulletin is actually printed/distributed. Every
 * caller-facing UI using these must label the result as a preview,
 * since simulated values must never be presented as
 * real observations or real actions.
 *
 * Farmer advisories carry `crop` in `meta`; Authority (DM/DC)
 * advisories don't (they're panchayat-wide, not crop-specific) — every
 * formatter here omits the crop line when it's absent instead
 * of printing "undefined".
 */

const SMS_CHARACTER_LIMIT = 160;

function cropLine(meta) {
  return meta.crop ? meta.crop : null;
}

/** @param {object} advisory @param {{ panchayat: string, crop?: string, audience: "farmer"|"authority" }} meta */
export function formatSmsPreview(advisory, meta) {
  const actionTitles = advisory.actions.map((a) => a.title).join("; ");
  const label = meta.audience === "authority" ? "Gov Advisory" : "Chas KVK";
  const scope = cropLine(meta);
  const text = `[${label}] ${meta.panchayat}${scope ? ` ${scope}` : ""}: ${advisory.summary} Actions: ${actionTitles}`;
  return text.length > SMS_CHARACTER_LIMIT
    ? `${text.slice(0, SMS_CHARACTER_LIMIT - 1)}…`
    : text;
}

/** @param {object} advisory @param {{ panchayat: string, crop?: string, audience: "farmer"|"authority" }} meta */
export function formatWhatsAppPreview(advisory, meta) {
  const title =
    meta.audience === "authority"
      ? `*Government Advisory — ${meta.panchayat}*`
      : `*Chas KVK Advisory — ${meta.panchayat}*`;
  const scope = cropLine(meta);
  const lines = [
    title,
    ...(scope ? [scope] : []),
    "",
    advisory.summary,
    "",
    "*Actions:*",
    ...advisory.actions.map(
      (a) => `• *${a.title}* (${a.priority}) — ${a.description}`,
    ),
    "",
    `Confidence: ${advisory.confidence}`,
  ];
  return lines.join("\n");
}

/** @param {object} advisory @param {{ panchayat: string, crop?: string, audience: "farmer"|"authority" }} meta */
export function formatIvrScript(advisory, meta) {
  const actionLines = advisory.actions
    .map((a, index) => `Point ${index + 1}: ${a.title}. ${a.description}`)
    .join(" ");
  const intro =
    meta.audience === "authority"
      ? `Namaste. This is an administrative advisory for ${meta.panchayat} panchayat.`
      : `Namaste. This is a crop advisory from Chas KVK for ${meta.panchayat} panchayat, ${meta.crop} crop.`;
  return [
    intro,
    advisory.summary,
    actionLines,
    "To hear this again, press one. To end the call, press two.",
  ].join(" ");
}

/** @param {object} advisory @param {{ panchayat: string, crop?: string, audience: "farmer"|"authority", publishedAt: string }} meta */
export function formatBulletin(advisory, meta) {
  const scope = cropLine(meta);
  return [
    meta.audience === "authority"
      ? "GRAMVISTAR GOVERNMENT ADVISORY BULLETIN"
      : "GRAMVISTAR FARMER ADVISORY BULLETIN",
    `Panchayat: ${meta.panchayat}`,
    ...(scope ? [`Crop: ${scope}`] : []),
    `Published: ${meta.publishedAt}`,
    "",
    "SUMMARY",
    advisory.summary,
    "",
    "RECOMMENDED ACTIONS",
    ...advisory.actions.map(
      (a, index) =>
        `${index + 1}. [${a.priority}] ${a.title} — ${a.description}`,
    ),
    "",
    "BASIS",
    ...advisory.reasons.map((r, index) => `${index + 1}. ${r}`),
    "",
    `Confidence: ${advisory.confidence}`,
    "",
    "— GramVistar KVK",
  ].join("\n");
}
