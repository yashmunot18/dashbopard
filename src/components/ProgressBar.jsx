import { pct, getAchievementBg, getAchievementColor } from '../utils/format';

export default function ProgressBar({ actual, target, showLabel = true, height = 'h-2' }) {
  const p = pct(actual, target);
  const clampedPct = Math.min(p, 100);

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ${getAchievementBg(p)}`}
          style={{ width: `${clampedPct}%` }}
        />
      </div>
      {showLabel && (
        <p className={`text-xs mt-1 font-medium ${getAchievementColor(p)}`}>
          {p}% achieved
        </p>
      )}
    </div>
  );
}
