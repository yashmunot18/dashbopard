import { useState, useEffect } from 'react';
import { Pencil, Trash2, Phone, Mail, Building2, Calendar } from 'lucide-react';
import { LEAD_STATUSES, LEAD_STATUS_COLORS, LEAD_STATUS_BG } from '../utils/constants';
import { getLeads, updateLead, deleteLead } from '../utils/storage';
import { formatINRShort } from '../utils/format';

export default function KanbanBoard() {
  const [leads, setLeads] = useState([]);
  const [dragging, setDragging] = useState(null);

  useEffect(() => {
    setLeads(getLeads());
  }, []);

  const byStatus = LEAD_STATUSES.reduce((acc, s) => {
    acc[s] = leads.filter((l) => l.status === s);
    return acc;
  }, {});

  const handleDragStart = (lead) => setDragging(lead);
  const handleDragEnd = () => setDragging(null);

  const handleDrop = (status) => {
    if (!dragging || dragging.status === status) return;
    const updated = updateLead(dragging.id, { status });
    setLeads(updated);
    setDragging(null);
  };

  const handleDelete = (id) => {
    if (window.confirm('Delete this lead?')) {
      setLeads(deleteLead(id));
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setLeads(updateLead(id, { status: newStatus }));
  };

  return (
    <div className="p-6 space-y-6 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Leads Board</h1>
        <p className="text-gray-500 text-sm mt-1">Kanban view — drag cards to update status</p>
      </div>

      {/* Summary strip */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {LEAD_STATUSES.map((s) => (
          <div key={s} className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border ${LEAD_STATUS_COLORS[s]}`}>
            {s}: {byStatus[s].length}
          </div>
        ))}
      </div>

      {/* Kanban columns */}
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
        {LEAD_STATUSES.map((status) => {
          const colLeads = byStatus[status];
          const colTotal = colLeads.reduce((s, l) => s + Number(l.estimatedTurnover || 0), 0);
          const isDragOver = dragging && dragging.status !== status;

          return (
            <div
              key={status}
              className={`flex-shrink-0 w-72 flex flex-col rounded-xl border-2 transition-all ${
                isDragOver ? `${LEAD_STATUS_BG[status]} border-dashed` : 'bg-gray-50 border-transparent'
              }`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(status)}
            >
              {/* Column header */}
              <div className={`p-3 rounded-t-xl border-b ${LEAD_STATUS_BG[status]}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${LEAD_STATUS_COLORS[status]}`}>
                    {status}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-gray-500">{colLeads.length} leads</span>
                    {colTotal > 0 && <p className="text-xs font-medium text-gray-600">{formatINRShort(colTotal)}</p>}
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-3 overflow-y-auto">
                {colLeads.length === 0 && (
                  <div className="py-8 text-center text-gray-300 text-sm">Drop here</div>
                )}
                {colLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-xl border shadow-sm p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                      dragging?.id === lead.id ? 'opacity-50 rotate-1 scale-105' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{lead.name}</p>
                        {lead.company && <p className="text-xs text-gray-400 truncate">{lead.company}</p>}
                      </div>
                      <div className="flex gap-1 ml-2 flex-shrink-0">
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1.5 mb-3">
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Phone className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{lead.phone}</span>
                        </div>
                      )}
                      {lead.email && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Mail className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Building2 className="w-3 h-3 flex-shrink-0" />
                        <span>{lead.branch} · {lead.stream}</span>
                      </div>
                      {lead.estimatedDate && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="w-3 h-3 flex-shrink-0" />
                          <span>{lead.estimatedDate}</span>
                        </div>
                      )}
                    </div>

                    {/* Turnover + status change */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                      {lead.estimatedTurnover ? (
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                          {formatINRShort(lead.estimatedTurnover)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300">No turnover set</span>
                      )}
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-1.5 py-1 bg-white ml-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    {lead.notes && (
                      <p className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50 line-clamp-2">
                        {lead.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
