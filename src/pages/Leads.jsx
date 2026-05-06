import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import { BRANCHES, STREAMS, LEAD_STATUSES, LEAD_STATUS_COLORS } from '../utils/constants';
import { getLeads, saveLeads, addLead, updateLead, deleteLead } from '../utils/storage';
import { formatINRShort, generateId } from '../utils/format';

const EMPTY_LEAD = {
  name: '',
  company: '',
  phone: '',
  email: '',
  branch: BRANCHES[0],
  stream: Object.keys(STREAMS)[0],
  status: 'New',
  estimatedTurnover: '',
  estimatedDate: '',
  notes: '',
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_LEAD);
  const [filterBranch, setFilterBranch] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    setLeads(getLeads());
  }, []);

  const filteredLeads = leads.filter((l) => {
    if (filterBranch !== 'All' && l.branch !== filterBranch) return false;
    if (filterStatus !== 'All' && l.status !== filterStatus) return false;
    if (searchQ && !`${l.name} ${l.company} ${l.phone}`.toLowerCase().includes(searchQ.toLowerCase())) return false;
    return true;
  });

  const openAdd = () => {
    setForm(EMPTY_LEAD);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (lead) => {
    setForm({ ...lead });
    setEditingId(lead.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this lead?')) {
      const updated = deleteLead(id);
      setLeads(updated);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      const updated = updateLead(editingId, { ...form });
      setLeads(updated);
    } else {
      const newLead = { ...form, id: generateId(), createdAt: new Date().toISOString() };
      const updated = addLead(newLead);
      setLeads(updated);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_LEAD);
  };

  const handleStatusChange = (id, newStatus) => {
    const updated = updateLead(id, { status: newStatus });
    setLeads(updated);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
          <p className="text-gray-500 text-sm mt-1">Track contacts, deals, and estimated revenues</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {LEAD_STATUSES.map((status) => {
          const count = leads.filter((l) => l.status === status).length;
          const total = leads.filter((l) => l.status === status).reduce((s, l) => s + Number(l.estimatedTurnover || 0), 0);
          return (
            <Card key={status} className={`p-4 border ${LEAD_STATUS_COLORS[status]}`}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-1">{status}</p>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs mt-1 opacity-75">{formatINRShort(total)}</p>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search name, company, phone..."
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
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
          <p className="text-sm text-gray-500">{filteredLeads.length} lead{filteredLeads.length !== 1 ? 's' : ''}</p>
        </div>
      </Card>

      {/* Leads table */}
      <Card>
        {filteredLeads.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg font-medium">No leads found</p>
            <p className="text-sm mt-1">Add your first lead using the button above</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-100">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Branch / Stream</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Est. Turnover</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Est. Date</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      {lead.company && <p className="text-xs text-gray-400">{lead.company}</p>}
                      {lead.phone && <p className="text-xs text-gray-400">{lead.phone}</p>}
                      {lead.email && <p className="text-xs text-gray-400">{lead.email}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-700">{lead.branch}</p>
                      <p className="text-xs text-gray-400">{lead.stream}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border cursor-pointer ${LEAD_STATUS_COLORS[lead.status]}`}
                      >
                        {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right font-medium text-gray-900">
                      {lead.estimatedTurnover ? formatINRShort(lead.estimatedTurnover) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {lead.estimatedDate || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 text-xs max-w-[180px] truncate">
                      {lead.notes || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEdit(lead)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(lead.id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Contact Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Company / Organisation</label>
                  <input value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}
                    placeholder="Company name"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+91 XXXXXXXXXX"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Branch</label>
                  <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                    {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Sales Stream</label>
                  <select value={form.stream} onChange={(e) => setForm({ ...form, stream: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                    {Object.keys(STREAMS).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300">
                    {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Turnover (₹)</label>
                  <input value={form.estimatedTurnover} onChange={(e) => setForm({ ...form, estimatedTurnover: e.target.value })}
                    placeholder="e.g. 5L or 500000"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Estimated Execution Date</label>
                  <input type="date" value={form.estimatedDate} onChange={(e) => setForm({ ...form, estimatedDate: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Any additional notes..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                  {editingId ? 'Update Lead' : 'Add Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
