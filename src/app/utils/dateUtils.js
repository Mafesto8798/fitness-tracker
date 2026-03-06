/**
 * Date utility functions for fitness tracker
 */

/**
 * Get the start of the current week (Monday)
 * @returns {Date} The start of the week
 */
export function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  // Calculate how many days to go back to get to Monday (day 1)
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const startOfWeek = new Date(now.setDate(diff));
  startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek;
}

/**
 * Get the end of the current week (Sunday)
 * @returns {Date} The end of the week
 */
export function getEndOfWeek() {
  const startOfWeek = getStartOfWeek();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek;
}

/**
 * Format a date as "Jan 6" or "Jan 6, 2025" if not current year
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const options = { month: 'short', day: 'numeric' };

  if (d.getFullYear() !== now.getFullYear()) {
    options.year = 'numeric';
  }

  return d.toLocaleDateString('en-US', options);
}

/**
 * Format a date range as "Jan 6 - Jan 12"
 * @param {Date} startDate - Start of range
 * @param {Date} endDate - End of range
 * @returns {string} Formatted date range string
 */
export function formatDateRange(startDate, endDate) {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

/**
 * Check if a date is within a date range
 * @param {Date|string} date - The date to check
 * @param {Date} startDate - Start of range
 * @param {Date} endDate - End of range
 * @returns {boolean} True if date is within range
 */
export function isDateInRange(date, startDate, endDate) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d >= startDate && d <= endDate;
}

/**
 * Get today's date as a string in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export function getTodayString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
