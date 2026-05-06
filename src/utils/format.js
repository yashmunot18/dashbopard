// Format number in Indian style (lakhs/crores)
export function formatINR(value, compact = false) {
  if (value === null || value === undefined || value === '') return '₹0';
  const num = Number(value);
  if (isNaN(num)) return '₹0';

  if (compact) {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num.toFixed(0)}`;
  }

  // Indian number formatting
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });
  return formatter.format(num);
}

export function formatINRShort(value) {
  const num = Number(value);
  if (isNaN(num) || num === 0) return '₹0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
}

export function parseINRInput(str) {
  if (!str) return 0;
  // Allow "5L", "5 lakh", "2.5Cr", "25000" etc.
  const s = String(str).replace(/,/g, '').trim().toLowerCase();
  const crMatch = s.match(/^([\d.]+)\s*(cr|crore|crores)$/);
  if (crMatch) return Math.round(parseFloat(crMatch[1]) * 10000000);
  const lMatch = s.match(/^([\d.]+)\s*(l|lakh|lakhs)$/);
  if (lMatch) return Math.round(parseFloat(lMatch[1]) * 100000);
  const kMatch = s.match(/^([\d.]+)\s*k$/);
  if (kMatch) return Math.round(parseFloat(kMatch[1]) * 1000);
  return Math.round(parseFloat(s) || 0);
}

export function getAchievementColor(pct) {
  if (pct >= 100) return 'text-green-600';
  if (pct >= 75) return 'text-yellow-600';
  if (pct >= 50) return 'text-orange-600';
  return 'text-red-600';
}

export function getAchievementBg(pct) {
  if (pct >= 100) return 'bg-green-500';
  if (pct >= 75) return 'bg-yellow-500';
  if (pct >= 50) return 'bg-orange-500';
  return 'bg-red-500';
}

export function pct(actual, target) {
  if (!target || target === 0) return 0;
  return Math.round((actual / target) * 100);
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
