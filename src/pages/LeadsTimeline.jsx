import { useState } from 'react';
import { Calendar, Phone, Mail, Building2, TrendingUp } from 'lucide-react';
import { BRANCHES, LEAD_STATUSES, LEAD_STATUS_COLORS, LEAD_STATUS_BG } from '../utils/constants';
import { getLeads } from '../utils/storage';
import { formatINRShort } from '../utils/format';

const STATUS_DOT = {
  'New': 'bg-blue-500',
  'In Progress': 'bg-yellow-500',
  'Negotiation': 'bg-purple-500',
  'Won': 'bg-green-500',
  'Lost': 'bg-red-500',
};

function groupByYearMonth(leads) {
  // leads without a date go to 'No Date'
  const map = {};
  for (const lead of leads) {
    let key;
    if (lead.estimatedDate) {
      const d = new Date(lead.estimatedDate);
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    } else {
      key = 'no-date';
    }
    if (!map[key]) map[key] = [];
    map[key].push(lead);
  }
  return map;
}

function monthLabel(key) {
  if (key === 'no-date') return 'No Estimated Date';
  const [year, month] = key.split('-');
  return new Date(Number(year), Number(month) - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

export default function LeadsTimeline() {
  const [leads] = useState(() => getLeads());
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  const filtered = leads.filter((l) => {
    if (filterBranch !== 'All' && l.branch !== filterBranch) return false;
    if (filterStatus !== 'All' && l.status !== filterStatus) return false;
    return true;
  });

  // Sort by estimated date ascending (undated at end)
  const sorted = [...filtered].sort((a, b) => {
    if (!a.estimatedDate && !b.estimatedDate) return 0;
    if (!a.estimatedDate) return 1;
    if (!b.estimatedDate) return -1;
    return new Date(a.estimatedDate) - new Date(b.estimatedDate);
  });

  const grouped = groupByYearMonth(sorted);
  const keys = Object.keys(grouped).sort((a, b) => {
    if (a === 'no-date') return 1;
    if (b === 'no-date') return -1;
    return a.localeCompare(b);
  });

  const totalEstimated = filtered.reduce((s, l) => s + Number(l.estimatedTurnover || 0), 0);
  const wonTotal = filtered.filter((l) => l.status === 'Won').reduce((s, l) => s + Number(l.estimatedTurnover || 0), 0);
  const activeTotal = filtered.filter((l) => !['Won', 'Lost'].includes(l.status)).reduce((s, l) => s + Number(l.estimatedTurnover || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads Timeline</h1>
        <p className="text-gray-500 text-sm mt-1">Chronological view of all leads by estimated execution date</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Leads</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Pipeline Value</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{formatINRShort(activeTotal)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Won Value</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{formatINRShort(wonTotal)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Est. Value</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{formatINRShort(totalEstimated)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <select value={filterBranch} onChange={(e) => setFilterBranch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="All">All Branches</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
            <option value="All">All Statuses</option>
            {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="flex gap-2 flex-wrap">
            {LEAD_STATUSES.map((s) => {
              const count = filtered.filter((l) => l.status === s).length;
              if (count === 0) return null;
              return (
                <span key={s} className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${LEAD_STATUS_COLORS[s]}`}>
                  {s}: {count}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Timeline */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
          <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No leads to display</p>
          <p className="text-sm mt-1">Add leads from the Leads page</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-8">
            {keys.map((key) => {
              const monthLeads = grouped[key];
              const monthTotal = monthLeads.reduce((s, l) => s + Number(l.estimatedTurnover || 0), 0);

              return (
                <div key={key} className="relative">
                  {/* Month marker */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-11 h-11 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-md z-10">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{monthLabel(key)}</h3>
                      <p className="text-xs text-gray-500">
                        {monthLeads.length} lead{monthLeads.length !== 1 ? 's' : ''}
                        {monthTotal > 0 && <span className="ml-2 text-blue-600 font-semibold">{formatINRShort(monthTotal)}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Lead cards for this month */}
                  <div className="ml-[52px] space-y-3">
                    {monthLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className={`relative bg-white rounded-xl border-2 shadow-sm p-4 transition-shadow hover:shadow-md ${LEAD_STATUS_BG[lead.status]}`}
                      >
                        {/* Status dot connector */}
                        <div className="absolute -left-[30px] top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <div className="w-px h-px" />
                          <div className={`w-3 h-3 rounded-full border-2 border-white shadow ${STATUS_DOT[lead.status]}`} />
                          <div className="w-6 h-px bg-gray-200" />
                        </div>

                        <div className="flex flex-wrap items-start justify-between gap-3">
                          {/* Left: contact info */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${LEAD_STATUS_COLORS[lead.status]}`}>
                                {lead.status}
                              </span>
                              {lead.estimatedDate && (
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(lead.estimatedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-gray-900">{lead.name}</p>
                            {lead.company && <p className="text-sm text-gray-500">{lead.company}</p>}
                            <div className="flex flex-wrap gap-3 mt-2">
                              {lead.phone && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Phone className="w-3 h-3" /> {lead.phone}
                                </span>
                              )}
                              {lead.email && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Mail className="w-3 h-3" /> {lead.email}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Building2 className="w-3 h-3" /> {lead.branch} · {lead.stream}
                              </span>
                            </div>
                            {lead.notes && (
                              <p className="text-xs text-gray-400 mt-2 italic line-clamp-2">{lead.notes}</p>
                            )}
                          </div>

                          {/* Right: turnover */}
                          {lead.estimatedTurnover > 0 && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                                <TrendingUp className="w-3 h-3" /> Est. Turnover
                              </p>
                              <p className="text-lg font-bold text-blue-700">{formatINRShort(lead.estimatedTurnover)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
