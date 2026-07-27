/**
 * contributions.js
 *
 * Handles all contribution CRUD operations:
 *  - Loads members into the dropdown and contributions into the table
 *  - Record, edit, and delete contributions via form
 *  - Search (live keyup filter) and sort (6 options)
 *  - XSS-safe table rendering
 *  - Toast notifications and activity logging
 *
 * Dependencies (adapt the paths to match your project):
 *  - ./api.js          → getMembers, getContributions, addContribution,
 *                        updateContribution, deleteContribution
 *  - ./utils.js        → showToast, showSpinner, hideSpinner,
 *                        formatCurrency, logActivity
 *
 * JSON Server data shape expected:
 *  contributions: [{ id, memberId, memberName, amount (number), date (YYYY-MM-DD) }]
 *  members:       [{ id, name, ... }]
 */

import {
  getMembers,
  getContributions,
  addContribution,
  updateContribution,
  deleteContribution,
} from './api.js';

import {
  showToast,
  showSpinner,
  hideSpinner,
  formatCurrency,
  logActivity,
} from '../utils.js';

// ─────────────────────────────────────────────────────────────────────────────
// State
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_ID = 'contributions';

let allContributions    = [];   // full list from API
let allMembers          = [];   // full member list (for dropdown)
let filteredContributions = []; // after search + sort
let editingId           = null; // id of record being edited, or null

// ─────────────────────────────────────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Escape user data before injecting into innerHTML (XSS protection). */
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&')
    .replace(/</g, '&lt;')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#39;');
}

/** Clear all inline field-error messages on the contribution form. */
function clearErrors() {
  ['contribution-member-error', 'contribution-amount-error', 'contribution-date-error']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '';
    });
}

/** Show an inline field error. */
function showError(errorId, message) {
  const el = document.getElementById(errorId);
  if (el) el.textContent = message;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data loading
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch members + contributions in parallel.
 * Populates the member dropdown and renders the table.
 */
async function loadData() {
  const tbody = document.getElementById('contributions-tbody');
  showSpinner(tbody);

  try {
    const [members, contributions] = await Promise.all([
      getMembers(),
      getContributions(),
    ]);

    allMembers        = members;
    allContributions  = contributions;
    filteredContributions = [...contributions];

    // Populate member dropdown — keep the placeholder at index 0
    const select = document.getElementById('contribution-member');
    while (select.options.length > 1) select.remove(1);

    allMembers.forEach(m => {
      const opt = document.createElement('option');
      opt.value        = m.id;
      opt.dataset.name = m.name;
      opt.textContent  = m.name;
      select.appendChild(opt);
    });

    renderTable();

  } catch (err) {
    showToast(`Error loading data: ${err.message}`, 'error');
    if (tbody) hideSpinner(tbody, '');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Search + Sort
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Filter allContributions by the search query and sort by the selected option.
 * Stores the result in filteredContributions and returns it.
 */
function applySortAndFilter() {
  const query   = (document.getElementById('contribution-search')?.value ?? '').toLowerCase().trim();
  const sortVal = document.getElementById('contribution-sort')?.value ?? 'newest';

  // 1. Filter
  let result = allContributions.filter(c => {
    if (!query) return true;
    return (
      (c.memberName ?? '').toLowerCase().includes(query) ||
      String(c.amount).includes(query) ||
      (c.date ?? '').includes(query)
    );
  });

  // 2. Sort
  result = [...result].sort((a, b) => {
    switch (sortVal) {
      case 'newest':      return new Date(b.date) - new Date(a.date);
      case 'oldest':      return new Date(a.date) - new Date(b.date);
      case 'amount-high': return Number(b.amount) - Number(a.amount);
      case 'amount-low':  return Number(a.amount) - Number(b.amount);
      case 'name-az':     return (a.memberName ?? '').localeCompare(b.memberName ?? '');
      case 'name-za':     return (b.memberName ?? '').localeCompare(a.memberName ?? '');
      default:            return 0;
    }
  });

  filteredContributions = result;
  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// Table rendering
// ─────────────────────────────────────────────────────────────────────────────

/** Rebuild the contributions table body. */
function renderTable() {
  const tbody = document.getElementById('contributions-tbody');
  if (!tbody) return;

  const rows = applySortAndFilter();

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center;padding:2rem;color:#64748b;">
          No contributions found.
        </td>
      </tr>`;
    return;
  }

  tbody.innerHTML = rows.map(c => `
    <tr>
      <td>${escapeHtml(c.memberName)}</td>
      <td>${escapeHtml(formatCurrency(c.amount))}</td>
      <td>${escapeHtml(c.date)}</td>
      <td>
        <button
          class="btn btn-primary btn-sm"
          aria-label="Edit contribution for ${escapeHtml(c.memberName)}"
          onclick="window.__editContribution('${escapeHtml(String(c.id))}')"
        ><i class="fas fa-edit"></i> Edit</button>
        <button
          class="btn btn-danger btn-sm"
          aria-label="Delete contribution for ${escapeHtml(c.memberName)}"
          onclick="window.__deleteContribution('${escapeHtml(String(c.id))}', '${escapeHtml(c.memberName)}')"
        ><i class="fas fa-trash"></i> Delete</button>
      </td>
    </tr>
  `).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// Form: Validate → Submit → Reset
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate the form. Returns field values on success, null on failure.
 */
function validateForm() {
  clearErrors();

  const memberSelect = document.getElementById('contribution-member');
  const amountInput  = document.getElementById('contribution-amount');
  const dateInput    = document.getElementById('contribution-date');

  const memberId   = memberSelect?.value ?? '';
  const memberName = memberSelect?.options[memberSelect.selectedIndex]?.dataset?.name ?? '';
  const amount     = amountInput?.value ?? '';
  const date       = dateInput?.value ?? '';

  let valid = true;

  if (!memberId) {
    showError('contribution-member-error', 'Please select a member.');
    valid = false;
  }
  if (!amount || Number(amount) <= 0) {
    showError('contribution-amount-error', 'Amount must be greater than 0.');
    valid = false;
  }
  if (!date) {
    showError('contribution-date-error', 'Please select a date.');
    valid = false;
  }

  return valid ? { memberId, memberName, amount, date } : null;
}

/** Handle the contribution form submit (add or update). */
async function handleFormSubmit(e) {
  e.preventDefault();

  const fields = validateForm();
  if (!fields) return;

  const { memberId, memberName, amount, date } = fields;
  const submitBtn = document.getElementById('contribution-submit');
  if (submitBtn) submitBtn.disabled = true;

  try {
    if (editingId) {
      await updateContribution(editingId, { memberId, memberName, amount: Number(amount), date });
      showToast('✓ Contribution Updated');
      logActivity('updated', 'contribution', memberName);
    } else {
      await addContribution({ memberId, memberName, amount: Number(amount), date });
      showToast('✓ Contribution Recorded');
      logActivity('created', 'contribution', memberName);
    }
    resetForm();
    await loadData();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    if (submitBtn) submitBtn.disabled = false;
  }
}

/** Reset the form back to "add" mode. */
function resetForm() {
  document.getElementById('contribution-form')?.reset();
  editingId = null;
  clearErrors();
  const btn = document.getElementById('contribution-submit');
  if (btn) btn.innerHTML = '<i class="fas fa-plus"></i> Record Contribution';
}

// ─────────────────────────────────────────────────────────────────────────────
// Edit / Delete handlers (exposed on window for inline onclick)
// ─────────────────────────────────────────────────────────────────────────────

function editContribution(id) {
  const c = allContributions.find(c => String(c.id) === String(id));
  if (!c) return;

  editingId = c.id;

  const memberSelect = document.getElementById('contribution-member');
  if (memberSelect) memberSelect.value = c.memberId;

  const amountInput = document.getElementById('contribution-amount');
  if (amountInput) amountInput.value = c.amount;

  const dateInput = document.getElementById('contribution-date');
  if (dateInput) dateInput.value = c.date;

  const btn = document.getElementById('contribution-submit');
  if (btn) btn.innerHTML = '<i class="fas fa-save"></i> Update Contribution';

  clearErrors();
  document.getElementById('contribution-form')
    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function deleteContributionEntry(id, memberName) {
  if (!confirm(`Delete this contribution for ${memberName}?`)) return;
  try {
    await deleteContribution(id);
    showToast('✓ Deleted Successfully');
    logActivity('deleted', 'contribution', memberName);
    await loadData();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  }
}

// Bridge the ES module boundary for inline onclick attributes
window.__editContribution   = editContribution;
window.__deleteContribution = deleteContributionEntry;

// ─────────────────────────────────────────────────────────────────────────────
// Navigation helper (sidebar + hamburger + overlay)
// ─────────────────────────────────────────────────────────────────────────────

function initNav(pageId) {
  document.querySelector(`a[data-page="${pageId}"]`)?.classList.add('active');

  const hamburger = document.getElementById('hamburger');
  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('sidebar-overlay');

  const open  = () => { sidebar?.classList.add('open');    overlay?.classList.add('visible'); };
  const close = () => { sidebar?.classList.remove('open'); overlay?.classList.remove('visible'); };

  hamburger?.addEventListener('click', () => sidebar?.classList.contains('open') ? close() : open());
  overlay?.addEventListener('click', close);
  sidebar?.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
}

// ─────────────────────────────────────────────────────────────────────────────
// Bootstrap
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  initNav(PAGE_ID);
  loadData();

  document.getElementById('contribution-form')
    ?.addEventListener('submit', handleFormSubmit);

  document.getElementById('contribution-search')
    ?.addEventListener('keyup', renderTable);

  document.getElementById('contribution-sort')
    ?.addEventListener('change', renderTable);
});
