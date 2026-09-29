import { RISK_LABELS } from "@/lib/riskLevels";

/**
 * Preview-only delivery-channel formatters for an escalated alert —
 * all delivery remains simulated. Same simulation
 * discipline as `src/lib/advisory/deliveryPreviews.js` and
 * `src/lib/feedback/feedbackPreviews.js`: nothing here is
 * ever actually sent.
 *
 * @typedef {{ panchayat: string, type: string, message: string }} AlertLike
 */

const SMS_CHARACTER_LIMIT = 160;

/** @param {AlertLike} alert @param {string} level one of RISK_LEVELS */
export function formatAlertSmsPreview(alert, level) {
  const text = `[Chas Alert - ${RISK_LABELS[level]}] ${alert.panchayat}: ${alert.type} — ${alert.message}`;
  return text.length > SMS_CHARACTER_LIMIT
    ? `${text.slice(0, SMS_CHARACTER_LIMIT - 1)}…`
    : text;
}

/** @param {AlertLike} alert @param {string} level */
export function formatAlertWhatsAppPreview(alert, level) {
  return [
    `*Chas Block Alert — ${RISK_LABELS[level]}*`,
    `${alert.panchayat} — ${alert.type}`,
    "",
    alert.message,
    "",
    `Level: *${level.toUpperCase()}*`,
  ].join("\n");
}

/** @param {AlertLike} alert @param {string} level */
export function formatAlertIvrScript(alert, level) {
  return [
    `This is a ${RISK_LABELS[level].toLowerCase()}-level alert from Chas Block administration for ${alert.panchayat} panchayat.`,
    `${alert.type}. ${alert.message}.`,
    "To hear this again, press one. To end the call, press two.",
  ].join(" ");
}

/** @param {AlertLike} alert @param {string} level @returns {{ title: string, body: string }} */
export function formatAlertPushPreview(alert, level) {
  return {
    title: `${RISK_LABELS[level]}: ${alert.type} — ${alert.panchayat}`,
    body: alert.message,
  };
}
