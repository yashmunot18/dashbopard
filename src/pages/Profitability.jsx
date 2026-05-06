import { useState, useEffect } from 'react';
import { Save, CheckCircle, TrendingDown, TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from 'recharts';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { BRANCHES, MONTHS, EXPENSE_CATEGORIES, CURRENT_YEAR, CURRENT_MONTH } from '../utils/constants';
import {
  getExpenses, saveExpenses, getExpenseTargets, saveExpenseTargets,
  getBranchExpenseTotal,
} from '../utils/storage';
import { formatINRShort, parseINRInput, pct } from '../utils/format';

const PIE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1', '#14b8a6',
];

export default function Profitability() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [expenses, setExpenses] = useState({});
  const [expenseTargets, setExpenseTargets] = useState({});
  const [actualInputs, setActualInputs] = useState({});
  const [targetInputs, setTargetInputs] = useState({});
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState('actual'); // 'actual' | 'target'

  const years = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

  useEffect(() => {
    const e = getExpenses();
    const et = getExpenseTargets();
    setExpenses(e);
    setExpenseTargets(et);

    const ai = {};
    const ti = {};
    for (const cat of EXPENSE_CATEGORIES) {
      const av = e?.[year]?.[month]?.[branch]?.[cat] ?? 0;
      const tv = et?.[year]?.[month]?.[branch]?.[cat] ?? 0;
      ai[cat] = av === 0 ? '' : String(av);
      ti[cat] = tv === 0 ? '' : String(tv);
    }
    setActualInputs(ai);
    setTargetInputs(ti);
  }, [year, month, branch]);

  const handleSave = () => {
    const e = { ...expenses };
    const et = { ...expenseTargets };
    for (const path of [[e, actualInputs], [et, targetInputs]]) {
      const [obj, inputs] = path;
      if (!obj[year]) obj[year] = {};
      if (!obj[year][month]) obj[year][month] = {};
      if (!obj[year][month][branch]) obj[year][month][branch] = {};
      for (const cat of EXPENSE_CATEGORIES) {
        obj[year][month][branch][cat] = parseINRInput(inputs[cat]);
      }
    }
    saveExpenses(e);
    saveExpenseTargets(et);
    setExpenses(e);
    setExpenseTargets(et);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalActual = EXPENSE_CATEGORIES.reduce((s, c) => s + parseINRInput(actualInputs[c] || '0'), 0);
  const totalTarget = EXPENSE_CATEGORIES.reduce((s, c) => s + parseINRInput(targetInputs[c] || '0'), 0);
  // For expenses, lower is better: target is the ceiling
  const costPct = pct(totalActual, totalTarget);
  const costWithinBudget = totalTarget === 0 || totalActual <= totalTarget;

  // Pie chart data
  const pieData = EXPENSE_CATEGORIES
    .map((cat, i) => ({ name: cat, value: parseINRInput(actualInputs[cat] || '0'), color: PIE_COLORS[i % PIE_COLORS.length] }))
    .filter((d) => d.value > 0);

  // Bar comparison across branches
  const branchBarData = BRANCHES.map((b) => ({
    name: b.split(' ')[0],
    Target: getBranchExpenseTotal(expenseTargets, year, month, b),
    Actual: getBranchExpenseTotal(expenses, year, month, b),
  }));

  // Monthly trend
  const trendData = [];
  for (let i = 5; i >= 0; i--) {
    let m = month - i;
    let y = year;
    if (m < 0) { m += 12; y -= 1; }
    trendData.push({
      name: MONTHS[m].slice(0, 3),
      Total: getBranchExpenseTotal(expenses, y, m, branch),
    });
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profitability Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Track expenses against budget targets per branch</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Data'}
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Year</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white min-w-[100px]">
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Month</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white min-w-[140px]">
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Branch</label>
            <select value={branch} onChange={(e) => setBranch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white min-w-[160px]">
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="ml-auto flex items-center gap-6">
            <div className="text-right">
              <p className="text-xs text-gray-500">Total Actual Cost</p>
              <p className="text-xl font-bold text-red-600">{formatINRShort(totalActual)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Budget Target</p>
              <p className="text-xl font-bold text-gray-700">{formatINRShort(totalTarget)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Status</p>
              <p className={`text-sm font-bold flex items-center gap-1 ${costWithinBudget ? 'text-green-600' : 'text-red-600'}`}>
                {costWithinBudget ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                {costWithinBudget ? 'Within Budget' : 'Over Budget'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-sm text-gray-500 mb-1">Total Expenses (Actual)</p>
          <p className="text-2xl font-bold text-red-600">{formatINRShort(totalActual)}</p>
          <p className="text-xs text-gray-400 mt-1">{MONTHS[month]} {year} · {branch}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500 mb-1">Budget (Target)</p>
          <p className="text-2xl font-bold text-gray-800">{formatINRShort(totalTarget)}</p>
          <p className={`text-xs mt-1 font-medium ${costPct <= 100 ? 'text-green-600' : 'text-red-600'}`}>
            {costPct}% of budget used
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-gray-500 mb-1">Budget Variance</p>
          <p className={`text-2xl font-bold ${totalActual <= totalTarget ? 'text-green-600' : 'text-red-600'}`}>
            {totalTarget > 0 ? (totalActual <= totalTarget ? '−' : '+') : ''}{formatINRShort(Math.abs(totalActual - totalTarget))}
          </p>
          <p className="text-xs text-gray-400 mt-1">{totalActual <= totalTarget ? 'Under budget 🎉' : 'Over budget ⚠️'}</p>
        </Card>
      </div>

      {/* Input mode toggle */}
      <div className="flex gap-2">
        <button onClick={() => setMode('actual')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'actual' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Enter Actuals
        </button>
        <button onClick={() => setMode('target')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'target' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Set Budget Targets
        </button>
      </div>

      {/* Expense table */}
      <Card>
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">
            {mode === 'actual' ? 'Actual Expenses' : 'Budget Targets'} — {branch} · {MONTHS[month]} {year}
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {EXPENSE_CATEGORIES.map((cat, i) => {
            const actual = parseINRInput(actualInputs[cat] || '0');
            const target = parseINRInput(targetInputs[cat] || '0');
            const catPct = pct(actual, target);
            const isOver = target > 0 && actual > target;

            return (
              <div key={cat} className="px-5 py-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                      <p className="font-medium text-gray-800 text-sm">{cat}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Actual: <span className="font-medium text-gray-700">{formatINRShort(actual)}</span></span>
                        <span>Budget: <span className="font-medium text-gray-700">{formatINRShort(target)}</span></span>
                        {target > 0 && (
                          <span className={`font-semibold ${isOver ? 'text-red-500' : 'text-green-600'}`}>
                            {catPct}%
                          </span>
                        )}
                      </div>
                    </div>
                    {target > 0 && (
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : catPct >= 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(catPct, 100)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="min-w-[180px]">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                      <input
                        type="text"
                        value={mode === 'actual' ? (actualInputs[cat] ?? '') : (targetInputs[cat] ?? '')}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (mode === 'actual') setActualInputs((p) => ({ ...p, [cat]: v }));
                          else setTargetInputs((p) => ({ ...p, [cat]: v }));
                          setSaved(false);
                        }}
                        placeholder={mode === 'actual' ? 'Actual amount' : 'Budget limit'}
                        className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="px-5 py-4 bg-gray-50 border-t flex items-center justify-between rounded-b-xl">
          <span className="font-semibold text-gray-700">Total</span>
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-xs text-gray-400">Actual</p>
              <p className="font-bold text-red-600">{formatINRShort(totalActual)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Budget</p>
              <p className="font-bold text-gray-800">{formatINRShort(totalTarget)}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie chart */}
        {pieData.length > 0 && (
          <Card className="p-5">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Expense Breakdown</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => formatINRShort(v)} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Branch comparison */}
        <Card className="p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">All Branches — Expenses ({MONTHS[month]})</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={branchBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => formatINRShort(v)} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => formatINRShort(v)} />
              <Legend />
              <Bar dataKey="Target" fill="#d1d5db" radius={[4, 4, 0, 0]} name="Budget" />
              <Bar dataKey="Actual" fill="#ef4444" radius={[4, 4, 0, 0]} name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* All branches expense table */}
      <Card>
        <div className="p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">All Branches Expense Summary — {MONTHS[month]} {year}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Branch</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actual</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Budget</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">% Used</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">Status</th>
              </tr>
            </thead>
            <tbody>
              {BRANCHES.map((b) => {
                const a = getBranchExpenseTotal(expenses, year, month, b);
                const t = getBranchExpenseTotal(expenseTargets, year, month, b);
                const p = pct(a, t);
                const over = t > 0 && a > t;
                return (
                  <tr key={b} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{b}</td>
                    <td className="px-5 py-3 text-right font-medium text-red-600">{formatINRShort(a)}</td>
                    <td className="px-5 py-3 text-right text-gray-500">{formatINRShort(t)}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${over ? 'text-red-600' : 'text-green-600'}`}>{p}%</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${over ? 'bg-red-100 text-red-700' : t > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {t === 0 ? 'No budget set' : over ? 'Over Budget' : 'Within Budget'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
