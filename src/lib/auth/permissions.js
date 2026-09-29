/**
 * RBAC is a frontend simulation only — there is no real authentication or
 * server-side authorization behind any of this.
 */

export const ROLES = ["Super Admin", "Scientist / KVK", "DM/DC", "Farmer"];

export const PORTALS = ["scientist", "farmer", "government"];

/**
 * Roles that pick a district/block (`/select-region`) right after logging
 * in, before landing on their portal. Super Admin skips it (instant entry)
 * and Farmer never sees it (their portal is scoped to a panchayat, not a
 * district/block).
 */
export const REGION_GATED_ROLES = ["Scientist / KVK", "DM/DC"];

/**
 * Which portals each role may open. "Super Admin" gets every portal.
 * DM/DC opens the Government portal.
 * @type {Record<string, string[]>}
 */
export const ROLE_PORTAL_ACCESS = {
  "Super Admin": ["scientist", "farmer", "government"],
  "Scientist / KVK": ["scientist"],
  "DM/DC": ["government"],
  Farmer: ["farmer"],
};

/**
 * @param {string | null} role
 * @param {string} portal
 * @returns {boolean}
 */
export function canAccessPortal(role, portal) {
  if (!role) return false;
  return ROLE_PORTAL_ACCESS[role]?.includes(portal) ?? false;
}

/**
 * The portal a role should land on immediately after logging in.
 * @param {string} role
 * @returns {string} a path, e.g. "/scientist"
 */
export function defaultPathForRole(role) {
  const portals = ROLE_PORTAL_ACCESS[role] ?? [];
  if (portals.length === 1) return `/${portals[0]}`;
  return "/";
}
