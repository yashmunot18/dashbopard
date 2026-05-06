import { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Target, Users, DollarSign, Building2 } from 'lucide-react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { BRANCHES, MONTHS, STREAMS, CURRENT_YEAR, CURRENT_MONTH } from '../utils/constants';
import { getTargets, getActuals, getLeads, getBranchMonthTotal } from '../utils/storage';
import { formatINRShort, pct } from '../utils/format';

export default function Overview() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [targets, setTargets] = useState({});
  const [actuals, setActuals] = useState({});
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    setTargets(getTargets());
    setActuals(getActuals());
    setLeads(getLeads());
  }, []);

  const years = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

  // Compute per-branch data
  const branchData = BRANCHES.map((branch) => {
    const t = getBranchMonthTotal(targets, year, month, branch);
    const a = getBranchMonthTotal(actuals, year, month, branch);
    return { branch, target: t, actual: a, pct: pct(a, t) };
  });

  const totalTarget = branchData.reduce((s, d) => s + d.target, 0);
  const totalActual = branchData.reduce((s, d) => s + d.actual, 0);
  const overallPct = pct(totalActual, totalTarget);

  const openLeads = leads.filter((l) => !['Won', 'Lost'].includes(l.status)).length;
  const wonLeads = leads.filter((l) => l.status === 'Won').length;

  const chartData = branchData.map((d) => ({
    name: d.branch.split(' ')[0], // short name for chart
    Target: d.target,
    Actual: d.actual,
  }));

  const formatTooltip = (value) => formatINRShort(value);

  // Monthly trend - last 6 months
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    let m = month - i;
    let y = year;
    if (m < 0) { m += 12; y -= 1; }
    let t = 0, a = 0;
    BRANCHES.forEach((branch) => {
      t += getBranchMonthTotal(targets, y, m, branch);
      a += getBranchMonthTotal(actuals, y, m, branch);
    });
    trendData.push({ name: MONTHS[m].slice(0, 3), Target: t, Actual: a });
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">NDC Diagnostic Centre — All Branches</p>
        </div>
        <div className="flex gap-3">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-sm"
          >
            {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">Total Target</p>
            <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatINRShort(totalTarget)}</p>
          <p className="text-xs text-gray-400 mt-1">{MONTHS[month]} {year}</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">Total Actual</p>
            <div className="w-9 h-9 bg-green-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatINRShort(totalActual)}</p>
          <p className={`text-xs mt-1 font-medium ${overallPct >= 100 ? 'text-green-600' : 'text-orange-500'}`}>
            {overallPct >= 100 ? <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {overallPct}% achieved</span> : `${overallPct}% achieved`}
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">Active Leads</p>
            <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{openLeads}</p>
          <p className="text-xs text-gray-400 mt-1">{wonLeads} won this period</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-500 font-medium">Branches</p>
            <div className="w-9 h-9 bg-orange-50 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{BRANCHES.length}</p>
          <p className="text-xs text-gray-400 mt-1">Active centres</p>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Branch Performance — {MONTHS[month]}</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatINRShort(v)} tick={{ fontSize: 11 }} />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Bar dataKey="Target" fill="#bfdbfe" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">6-Month Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={trendData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatINRShort(v)} tick={{ fontSize: 11 }} />
              <Tooltip formatter={formatTooltip} />
              <Legend />
              <Bar dataKey="Target" fill="#d1fae5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Branch breakdown table */}
      <Card>
        <div className="p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Branch Breakdown — {MONTHS[month]} {year}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Branch</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Target</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actual</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Achievement</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Progress</th>
              </tr>
            </thead>
            <tbody>
              {branchData.map((d, i) => (
                <tr key={d.branch} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                  <td className="px-5 py-3.5 font-medium text-gray-900">{d.branch}</td>
                  <td className="px-5 py-3.5 text-right text-gray-600">{formatINRShort(d.target)}</td>
                  <td className="px-5 py-3.5 text-right text-gray-900 font-medium">{formatINRShort(d.actual)}</td>
                  <td className={`px-5 py-3.5 text-right font-semibold ${d.pct >= 100 ? 'text-green-600' : d.pct >= 75 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {d.pct}%
                  </td>
                  <td className="px-5 py-3.5">
                    <ProgressBar actual={d.actual} target={d.target} showLabel={false} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 font-semibold">
                <td className="px-5 py-3 text-blue-900">Total</td>
                <td className="px-5 py-3 text-right text-blue-900">{formatINRShort(totalTarget)}</td>
                <td className="px-5 py-3 text-right text-blue-900">{formatINRShort(totalActual)}</td>
                <td className={`px-5 py-3 text-right ${overallPct >= 100 ? 'text-green-700' : 'text-orange-600'}`}>{overallPct}%</td>
                <td className="px-5 py-3">
                  <ProgressBar actual={totalActual} target={totalTarget} showLabel={false} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
