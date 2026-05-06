import { STREAMS, EXPENSE_CATEGORIES } from './constants';

// ─── Storage Keys ────────────────────────────────────────────────────────────
const KEYS = {
  TARGETS: 'ndc_targets',
  ACTUALS: 'ndc_actuals',
  LEADS: 'ndc_leads',
  EXPENSES: 'ndc_expenses',
  EXPENSE_TARGETS: 'ndc_expense_targets',
};

function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Targets ─────────────────────────────────────────────────────────────────
// Structure: targets[year][monthIndex][branch][stream][subStream] = number
export function getTargets() {
  return load(KEYS.TARGETS) || {};
}

export function saveTargets(targets) {
  save(KEYS.TARGETS, targets);
}

export function getTarget(year, month, branch, stream, subStream) {
  const t = getTargets();
  return t?.[year]?.[month]?.[branch]?.[stream]?.[subStream] ?? 0;
}

export function setTarget(year, month, branch, stream, subStream, value) {
  const t = getTargets();
  if (!t[year]) t[year] = {};
  if (!t[year][month]) t[year][month] = {};
  if (!t[year][month][branch]) t[year][month][branch] = {};
  if (!t[year][month][branch][stream]) t[year][month][branch][stream] = {};
  t[year][month][branch][stream][subStream] = value;
  saveTargets(t);
}

// ─── Actuals ──────────────────────────────────────────────────────────────────
// Structure: actuals[year][monthIndex][branch][stream][subStream] = number
export function getActuals() {
  return load(KEYS.ACTUALS) || {};
}

export function saveActuals(actuals) {
  save(KEYS.ACTUALS, actuals);
}

export function getActual(year, month, branch, stream, subStream) {
  const a = getActuals();
  return a?.[year]?.[month]?.[branch]?.[stream]?.[subStream] ?? 0;
}

export function setActual(year, month, branch, stream, subStream, value) {
  const a = getActuals();
  if (!a[year]) a[year] = {};
  if (!a[year][month]) a[year][month] = {};
  if (!a[year][month][branch]) a[year][month][branch] = {};
  if (!a[year][month][branch][stream]) a[year][month][branch][stream] = {};
  a[year][month][branch][stream][subStream] = value;
  saveActuals(a);
}

// Compute totals for a branch in a given period
export function getBranchMonthTotal(data, year, month, branch) {
  let total = 0;
  const d = data?.[year]?.[month]?.[branch];
  if (!d) return 0;
  for (const stream of Object.keys(STREAMS)) {
    for (const sub of STREAMS[stream]) {
      total += d?.[stream]?.[sub] ?? 0;
    }
  }
  return total;
}

export function getStreamMonthTotal(data, year, month, branch, stream) {
  let total = 0;
  const d = data?.[year]?.[month]?.[branch]?.[stream];
  if (!d) return 0;
  for (const sub of STREAMS[stream]) {
    total += d?.[sub] ?? 0;
  }
  return total;
}

// ─── Leads ───────────────────────────────────────────────────────────────────
export function getLeads() {
  return load(KEYS.LEADS) || [];
}

export function saveLeads(leads) {
  save(KEYS.LEADS, leads);
}

export function addLead(lead) {
  const leads = getLeads();
  leads.unshift(lead);
  saveLeads(leads);
  return leads;
}

export function updateLead(id, updates) {
  const leads = getLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx !== -1) {
    leads[idx] = { ...leads[idx], ...updates };
    saveLeads(leads);
  }
  return leads;
}

export function deleteLead(id) {
  const leads = getLeads().filter((l) => l.id !== id);
  saveLeads(leads);
  return leads;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────
// Structure: expenses[year][monthIndex][branch][category] = number
export function getExpenses() {
  return load(KEYS.EXPENSES) || {};
}

export function saveExpenses(expenses) {
  save(KEYS.EXPENSES, expenses);
}

export function setExpense(year, month, branch, category, value) {
  const e = getExpenses();
  if (!e[year]) e[year] = {};
  if (!e[year][month]) e[year][month] = {};
  if (!e[year][month][branch]) e[year][month][branch] = {};
  e[year][month][branch][category] = value;
  saveExpenses(e);
}

export function getExpense(year, month, branch, category) {
  const e = getExpenses();
  return e?.[year]?.[month]?.[branch]?.[category] ?? 0;
}

// Expense targets
export function getExpenseTargets() {
  return load(KEYS.EXPENSE_TARGETS) || {};
}

export function saveExpenseTargets(et) {
  save(KEYS.EXPENSE_TARGETS, et);
}

export function setExpenseTarget(year, month, branch, category, value) {
  const et = getExpenseTargets();
  if (!et[year]) et[year] = {};
  if (!et[year][month]) et[year][month] = {};
  if (!et[year][month][branch]) et[year][month][branch] = {};
  et[year][month][branch][category] = value;
  saveExpenseTargets(et);
}

export function getExpenseTarget(year, month, branch, category) {
  const et = getExpenseTargets();
  return et?.[year]?.[month]?.[branch]?.[category] ?? 0;
}

export function getBranchExpenseTotal(data, year, month, branch) {
  let total = 0;
  for (const cat of EXPENSE_CATEGORIES) {
    total += data?.[year]?.[month]?.[branch]?.[cat] ?? 0;
  }
  return total;
}
