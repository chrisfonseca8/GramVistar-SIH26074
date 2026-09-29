/** @param {Date} date @returns {number} 1-366 */
export function getDayOfYear(date) {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  return Math.floor((date.getTime() - start) / 86400000) + 1;
}

/** @param {number} year @param {number} month 1-12 @returns {number} */
export function getDaysInMonth(year, month) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}
