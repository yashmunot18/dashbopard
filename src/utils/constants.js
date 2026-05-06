export const BRANCHES = [
  'Kopat',
  'Savarkar Nagar',
  'GB Road',
  'Rabodi',
  'Kalyan',
  'Seawoods',
  'Kharghar',
  'Kurla',
];

export const STREAMS = {
  'Walk-in Sales': ['NDC Health Package', 'Doctor Referrals'],
  'TPA Sales': ['Standalone Category'],
  'Corporate Business': ['Industrial Health Checkups'],
  'B2B': ['Franchises', 'Hospitals'],
};

export const STREAM_COLORS = {
  'Walk-in Sales': 'blue',
  'TPA Sales': 'green',
  'Corporate Business': 'purple',
  'B2B': 'orange',
};

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export const LEAD_STATUSES = ['New', 'In Progress', 'Negotiation', 'Won', 'Lost'];

export const LEAD_STATUS_COLORS = {
  'New': 'bg-blue-100 text-blue-800 border-blue-200',
  'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Negotiation': 'bg-purple-100 text-purple-800 border-purple-200',
  'Won': 'bg-green-100 text-green-800 border-green-200',
  'Lost': 'bg-red-100 text-red-800 border-red-200',
};

export const LEAD_STATUS_BG = {
  'New': 'bg-blue-50 border-blue-200',
  'In Progress': 'bg-yellow-50 border-yellow-200',
  'Negotiation': 'bg-purple-50 border-purple-200',
  'Won': 'bg-green-50 border-green-200',
  'Lost': 'bg-red-50 border-red-200',
};

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Salaries',
  'Electricity',
  'Consumables (Reagents/Films)',
  'Marketing',
  'Maintenance & AMC',
  'TPA/Insurance Discounts',
  'Doctor Referral Payouts',
  'Housekeeping',
  'Internet & Telecom',
  'Miscellaneous',
];

export const CURRENT_YEAR = new Date().getFullYear();
export const CURRENT_MONTH = new Date().getMonth(); // 0-indexed
