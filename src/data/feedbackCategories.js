/**
 * The 5 farmer feedback categories, shared between the
 * Farmer feedback form (which needs the list to build its category
 * picker) and the Scientist Feedback Inbox (which needs the same list
 * for its category filter) — one source of truth instead of two
 * independently-maintained copies.
 */
export const FEEDBACK_CATEGORIES = [
  "cropStage",
  "irrigation",
  "pest",
  "damage",
  "yield",
];
