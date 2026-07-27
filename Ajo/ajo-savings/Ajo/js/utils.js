/**
 * utils.js — Shared utilities
 * showToast, showSpinner, hideSpinner, formatCurrency, logActivity
 */

const ACTIVITY_KEY    = 'app_activities';
const ACTIVITY_MAX    = 20;
const TOAST_DURATION  = 3000;

/** Show a toast notification. type: 'success' | 'error' */
export function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), TOAST_DURATION);
}

/** Replace container innerHTML with a loading spinner. */
export function showSpinner(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="spinner-wrapper">
      <div class="spinner"></div>
    </div>`;
}

/** Restore container innerHTML after loading. */
export function hideSpinner(container, html = '') {
  if (!container) return;
  container.innerHTML = html;
}

/** Format a number as ₦1,234,567 */
export function formatCurrency(amount) {
  return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 0 })}`;
}

/** Log an activity entry to sessionStorage (most recent first, max 20). */
export function logActivity(type, resource, description) {
  const activities = getActivities();
  activities.unshift({ type, resource, description, timestamp: new Date().toISOString() });
  sessionStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities.slice(0, ACTIVITY_MAX)));
}

/** Get all activity entries from sessionStorage. */
export function getActivities() {
  try {
    return JSON.parse(sessionStorage.getItem(ACTIVITY_KEY) ?? '[]');
  } catch {
    return [];
  }
}
