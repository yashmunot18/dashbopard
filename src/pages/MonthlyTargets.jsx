import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Save, CheckCircle } from 'lucide-react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { BRANCHES, MONTHS, STREAMS, STREAM_COLORS, CURRENT_YEAR, CURRENT_MONTH } from '../utils/constants';
import {
  getTargets, saveTargets, getActuals,
  getBranchMonthTotal, getStreamMonthTotal,
} from '../utils/storage';
import { formatINRShort, parseINRInput, pct } from '../utils/format';

const COLOR_CLASSES = {
  blue: { header: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  green: { header: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  purple: { header: 'bg-purple-50 border-purple-200', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  orange: { header: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
};

export default function MonthlyTargets() {
  const [year, setYear] = useState(CURRENT_YEAR);
  const [month, setMonth] = useState(CURRENT_MONTH);
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [targets, setTargets] = useState({});
  const [actuals, setActuals] = useState({});
  const [inputValues, setInputValues] = useState({});
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(Object.keys(STREAMS).reduce((a, s) => ({ ...a, [s]: true }), {}));

  const years = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

  useEffect(() => {
    const t = getTargets();
    const a = getActuals();
    setTargets(t);
    setActuals(a);
    // Populate input values from stored targets
    const iv = {};
    for (const stream of Object.keys(STREAMS)) {
      for (const sub of STREAMS[stream]) {
        const val = t?.[year]?.[month]?.[branch]?.[stream]?.[sub] ?? 0;
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
    const t = { ...targets };
    if (!t[year]) t[year] = {};
    if (!t[year][month]) t[year][month] = {};
    if (!t[year][month][branch]) t[year][month][branch] = {};
    for (const stream of Object.keys(STREAMS)) {
      if (!t[year][month][branch][stream]) t[year][month][branch][stream] = {};
      for (const sub of STREAMS[stream]) {
        const raw = inputValues[`${stream}__${sub}`];
        t[year][month][branch][stream][sub] = parseINRInput(raw);
      }
    }
    saveTargets(t);
    setTargets(t);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleStream = (stream) => {
    setExpanded((prev) => ({ ...prev, [stream]: !prev[stream] }));
  };

  const totalTarget = Object.keys(STREAMS).reduce((sum, stream) => {
    return sum + STREAMS[stream].reduce((s2, sub) => {
      return s2 + parseINRInput(inputValues[`${stream}__${sub}`] || '0');
    }, 0);
  }, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monthly Targets</h1>
          <p className="text-gray-500 text-sm mt-1">Set revenue targets per branch, stream, and month</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm shadow-sm transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Targets'}
        </button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white min-w-[100px]"
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white min-w-[140px]"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Branch</label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white min-w-[160px]"
            >
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div className="ml-auto">
            <p className="text-xs text-gray-500">Total target</p>
            <p className="text-xl font-bold text-blue-700">{formatINRShort(totalTarget)}</p>
          </div>
        </div>
      </Card>

      {/* Streams */}
      <div className="space-y-4">
        {Object.entries(STREAMS).map(([stream, subs]) => {
          const color = STREAM_COLORS[stream] || 'blue';
          const cls = COLOR_CLASSES[color] || COLOR_CLASSES.blue;
          const streamTargetTotal = subs.reduce((s, sub) => s + parseINRInput(inputValues[`${stream}__${sub}`] || '0'), 0);
          const streamActualTotal = getStreamMonthTotal(actuals, year, month, branch, stream);
          const p = pct(streamActualTotal, streamTargetTotal);
          const isOpen = expanded[stream];

          return (
            <Card key={stream}>
              {/* Stream header */}
              <button
                onClick={() => toggleStream(stream)}
                className={`w-full flex items-center justify-between p-4 rounded-t-xl border-b ${cls.header} transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${cls.dot}`} />
                  <span className="font-semibold text-gray-800">{stream}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls.badge}`}>
                    {subs.length} sub-stream{subs.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Target</p>
                    <p className="text-sm font-bold text-gray-800">{formatINRShort(streamTargetTotal)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Actual</p>
                    <p className={`text-sm font-bold ${p >= 100 ? 'text-green-600' : 'text-orange-500'}`}>{formatINRShort(streamActualTotal)}</p>
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </div>
              </button>

              {/* Sub-streams */}
              {isOpen && (
                <div className="divide-y divide-gray-50">
                  {subs.map((sub) => {
                    const key = `${stream}__${sub}`;
                    const inputVal = inputValues[key] ?? '';
                    const targetNum = parseINRInput(inputVal || '0');
                    const actualNum = actuals?.[year]?.[month]?.[branch]?.[stream]?.[sub] ?? 0;
                    const p2 = pct(actualNum, targetNum);

                    return (
                      <div key={sub} className="px-5 py-4">
                        <div className="flex items-start justify-between gap-6">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-800 text-sm">{sub}</p>
                            <div className="mt-2">
                              <ProgressBar actual={actualNum} target={targetNum} height="h-1.5" />
                            </div>
                            {targetNum > 0 && (
                              <p className="text-xs text-gray-400 mt-1">
                                Actual: {formatINRShort(actualNum)} / Target: {formatINRShort(targetNum)}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 min-w-[180px]">
                            <label className="text-xs text-gray-400">Target Amount (₹)</label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                              <input
                                type="text"
                                value={inputVal}
                                onChange={(e) => handleInput(stream, sub, e.target.value)}
                                placeholder="e.g. 5L or 500000"
                                className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
                              />
                            </div>
                            {inputVal && (
                              <p className="text-xs text-gray-400">= {formatINRShort(parseINRInput(inputVal))}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* All-branches quick view */}
      <Card>
        <div className="p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">All Branches — {MONTHS[month]} {year} Summary</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-y border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Branch</th>
                {Object.keys(STREAMS).map((s) => (
                  <th key={s} className="px-3 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.split(' ')[0]}</th>
                ))}
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody>
              {BRANCHES.map((b) => (
                <tr key={b} className={`border-b border-gray-50 hover:bg-gray-50 ${b === branch ? 'bg-blue-50/40' : ''}`}>
                  <td className="px-5 py-3 font-medium text-gray-900">{b}</td>
                  {Object.keys(STREAMS).map((s) => (
                    <td key={s} className="px-3 py-3 text-right text-gray-600 text-xs">
                      {formatINRShort(getStreamMonthTotal(targets, year, month, b, s))}
                    </td>
                  ))}
                  <td className="px-5 py-3 text-right font-semibold text-gray-800">
                    {formatINRShort(getBranchMonthTotal(targets, year, month, b))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
