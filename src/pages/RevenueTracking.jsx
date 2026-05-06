import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { BRANCHES, MONTHS, STREAMS, STREAM_COLORS, CURRENT_YEAR, CURRENT_MONTH } from '../utils/constants';
import {
  getTargets, getActuals, saveActuals,
  getBranchMonthTotal, getStreamMonthTotal,
} from '../utils/storage';
import { formatINRShort, parseINRInput, pct } from '../utils/format';

const COLOR_CLASSES = {
  blue: { badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', ring: 'focus:ring-blue-300' },
  green: { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', ring: 'focus:ring-green-300' },
  purple: { badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500', ring: 'focus:ring-purple-300' },
  orange: { badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', ring: 'focus:ring-orange-300' },
};

export default function RevenueTracking() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [targets, setTargets] = useState({});
  const [actuals, setActuals] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [saved, setSaved] = useState(false);

  const years = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

  useEffect(() => {
    const t = getTargets();
    const a = getActuals();
    setTargets(t);
    setActuals(a);
    const iv = {};
    for (const stream of Object.keys(STREAMS)) {
      for (const sub of STREAMS[stream]) {
        const val = a?.[year]?.[month]?.[branch]?.[stream]?.[sub] ?? 0;
        iv[`${stream}__${sub}`] = val === 0 ? '' : String(val);
      }
    }
    setInputValues(iv);
  }, [year, month, branch]);

  const handleInput = (stream, sub, val) => {
    setInputValues((prev) => ({ ...prev, [`${stream}__${sub}`]: val }));
    setSaved(false);
  };

  const handleSave = () => {
    const a = { ...actuals };
    if (!a[year]) a[year] = {};
    if (!a[year][month]) a[year][month] = {};
    if (!a[year][month][branch]) a[year][month][branch] = {};
    for (const stream of Object.keys(STREAMS)) {
      if (!a[year][month][branch][stream]) a[year][month][branch][stream] = {};
      for (const sub of STREAMS[stream]) {
        const raw = inputValues[`${stream}__${sub}`];
        a[year][month][branch][stream][sub] = parseINRInput(raw);
      }
    }
    saveActuals(a);
    setActuals(a);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const totalActual = Object.keys(STREAMS).reduce((sum, stream) =>
    sum + STREAMS[stream].reduce((s2, sub) =>
      s2 + parseINRInput(inputValues[`${stream}__${sub}`] || '0'), 0), 0);
  const totalTarget = getBranchMonthTotal(targets, year, month, branch);
  const overallPct = pct(totalActual, totalTarget);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Revenue Tracking</h1>
          <p className="text-gray-500 text-sm mt-1">Enter actual revenue data against targets</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-all ${
            saved ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Actuals'}
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
          <div className="ml-auto text-right">
            <p className="text-xs text-gray-500">Overall Achievement</p>
            <p className={`text-xl font-bold ${overallPct >= 100 ? 'text-green-600' : overallPct >= 75 ? 'text-yellow-600' : 'text-red-500'}`}>
              {overallPct}%
            </p>
            <p className="text-xs text-gray-400">{formatINRShort(totalActual)} / {formatINRShort(totalTarget)}</p>
          </div>
        </div>
      </Card>

      {/* Overall progress */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">Overall Progress — {branch}</h2>
          <span className="text-sm text-gray-500">{MONTHS[month]} {year}</span>
        </div>
        <ProgressBar actual={totalActual} target={totalTarget} height="h-3" />
      </Card>

      {/* Stream-wise input */}
      <div className="space-y-4">
        {Object.entries(STREAMS).map(([stream, subs]) => {
          const color = STREAM_COLORS[stream] || 'blue';
          const cls = COLOR_CLASSES[color] || COLOR_CLASSES.blue;
          const streamActual = subs.reduce((s, sub) => s + parseINRInput(inputValues[`${stream}__${sub}`] || '0'), 0);
          const streamTarget = getStreamMonthTotal(targets, year, month, branch, stream);
          const streamPct = pct(streamActual, streamTarget);

          return (
            <Card key={stream} className="overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${cls.dot}`} />
                  <span className="font-semibold text-gray-800">{stream}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Target</p>
                    <p className="text-sm font-medium text-gray-600">{formatINRShort(streamTarget)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Actual</p>
                    <p className="text-sm font-bold text-gray-900">{formatINRShort(streamActual)}</p>
                  </div>
                  <div className={`text-sm font-bold min-w-[50px] text-right ${streamPct >= 100 ? 'text-green-600' : streamPct >= 75 ? 'text-yellow-600' : 'text-red-500'}`}>
                    {streamPct}%
                  </div>
                </div>
              </div>
              <div className="divide-y divide-gray-50">
                {subs.map((sub) => {
                  const key = `${stream}__${sub}`;
                  const actualNum = parseINRInput(inputValues[key] || '0');
                  const targetNum = targets?.[year]?.[month]?.[branch]?.[stream]?.[sub] ?? 0;
                  const p2 = pct(actualNum, targetNum);

                  return (
                    <div key={sub} className="px-5 py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-700 text-sm mb-1">{sub}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>Target: {formatINRShort(targetNum)}</span>
                            <span className={p2 >= 100 ? 'text-green-600' : p2 >= 75 ? 'text-yellow-600' : 'text-red-500'}>
                              {p2}% achieved
                            </span>
                          </div>
                          <div className="mt-2">
                            <ProgressBar actual={actualNum} target={targetNum} showLabel={false} height="h-1.5" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 min-w-[200px]">
                          <label className="text-xs text-gray-400">Actual Revenue (₹)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                            <input
                              type="text"
                              value={inputValues[key] ?? ''}
                              onChange={(e) => handleInput(stream, sub, e.target.value)}
                              placeholder="e.g. 3L or 300000"
                              className={`w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 ${cls.ring} focus:border-transparent`}
                            />
                          </div>
                          {inputValues[key] && (
                            <p className="text-xs text-gray-400">= {formatINRShort(parseINRInput(inputValues[key]))}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Cross-branch comparison */}
      <Card>
        <div className="p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">All Branches — Actual vs Target ({MONTHS[month]} {year})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Branch</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Target</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Actual</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">%</th>
                <th className="px-5 py-3 w-40 text-xs font-semibold text-gray-500 uppercase tracking-wide">Progress</th>
              </tr>
            </thead>
            <tbody>
              {BRANCHES.map((b) => {
                const t = getBranchMonthTotal(targets, year, month, b);
                const a = getBranchMonthTotal(actuals, year, month, b);
                const p2 = pct(a, t);
                return (
                  <tr key={b} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium text-gray-900">{b}</td>
                    <td className="px-5 py-3 text-right text-gray-500">{formatINRShort(t)}</td>
                    <td className="px-5 py-3 text-right font-medium text-gray-900">{formatINRShort(a)}</td>
                    <td className={`px-5 py-3 text-right font-semibold ${p2 >= 100 ? 'text-green-600' : p2 >= 75 ? 'text-yellow-600' : 'text-red-500'}`}>{p2}%</td>
                    <td className="px-5 py-3"><ProgressBar actual={a} target={t} showLabel={false} /></td>
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
