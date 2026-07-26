import React, { useMemo, useState } from 'react';
import type { GithubActivity } from '../../../lib/github-activity';
import { activityLevelFromCount } from '../../../lib/github-activity';

interface ActivityTimelineProps {
  activity: GithubActivity;
}

type ViewMode = 'yearly' | 'monthly';

function levelLabel(level: ReturnType<typeof activityLevelFromCount>): string {
  switch (level) {
    case 'high':
      return 'HIGH';
    case 'medium':
      return 'MEDIUM';
    case 'low':
      return 'LOW';
    default:
      return 'NONE';
  }
}

/** Color only when hovered/focused — default stays monochrome. */
function cubeFace(level: ReturnType<typeof activityLevelFromCount>, lit: boolean): {
  top: string;
  left: string;
  right: string;
} {
  if (!lit) {
    if (level === 'none') return { top: '#d4d4d4', left: '#bdbdbd', right: '#a3a3a3' };
    if (level === 'low') return { top: '#b0b0b0', left: '#9a9a9a', right: '#808080' };
    if (level === 'medium') return { top: '#8a8a8a', left: '#737373', right: '#5c5c5c' };
    return { top: '#525252', left: '#404040', right: '#2e2e2e' };
  }
  if (level === 'none') return { top: '#d1d5db', left: '#9ca3af', right: '#6b7280' };
  if (level === 'low') return { top: '#fb923c', left: '#ea580c', right: '#c2410c' };
  if (level === 'medium') return { top: '#fde047', left: '#eab308', right: '#a16207' };
  return { top: '#4ade80', left: '#22c55e', right: '#15803d' };
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activity }) => {
  const [view, setView] = useState<ViewMode>('yearly');
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);

  const { bars, years, max } = useMemo(() => {
    const now = new Date();
    const created = activity.user?.createdAt ? new Date(activity.user.createdAt) : null;
    let startYear =
      created && !Number.isNaN(created.getTime()) ? created.getUTCFullYear() : now.getFullYear() - 4;
    startYear = Math.max(startYear, now.getFullYear() - 4);
    const endYear = now.getFullYear();
    const yearList: number[] = [];
    for (let y = startYear; y <= endYear; y++) yearList.push(y);

    if (view === 'yearly') {
      const byYear = new Map<number, number>();
      for (const y of yearList) byYear.set(y, 0);
      for (const day of activity.timeline) {
        const y = Number(day.date.slice(0, 4));
        if (byYear.has(y)) byYear.set(y, (byYear.get(y) ?? 0) + day.commits);
      }
      for (const repo of activity.repos) {
        const iso = repo.pushedAt ?? repo.updatedAt;
        if (!iso) continue;
        const y = new Date(iso).getFullYear();
        if (byYear.has(y) && (byYear.get(y) ?? 0) === 0) byYear.set(y, 1);
      }
      const list = yearList.map((y) => ({
        id: String(y),
        label: String(y),
        dateLabel: String(y),
        commits: byYear.get(y) ?? 0,
      }));
      return {
        bars: list,
        years: yearList,
        max: Math.max(1, ...list.map((b) => b.commits)),
      };
    }

    // Monthly — last 12 months as cube columns
    const byMonth = new Map<string, number>();
    for (const day of activity.timeline) {
      const m = day.date.slice(0, 7);
      byMonth.set(m, (byMonth.get(m) ?? 0) + day.commits);
    }
    const list: { id: string; label: string; dateLabel: string; commits: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      list.push({
        id,
        label: d.toLocaleDateString(undefined, { month: 'short' }),
        dateLabel: d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
        commits: byMonth.get(id) ?? 0,
      });
    }
    return {
      bars: list,
      years: yearList,
      max: Math.max(1, ...list.map((b) => b.commits)),
    };
  }, [activity, view]);

  const activeId = hovered ?? focused;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h4 className="font-mono text-xs font-bold text-gray-500 uppercase">// ACTIVITY_TIMELINE</h4>
        <div className="flex flex-wrap items-center gap-3">
          <div
            className="hidden sm:flex items-center gap-3 font-mono text-[9px] font-bold uppercase text-gray-500"
            aria-hidden
          >
            <span className="inline-flex items-center gap-1">
              <i className="w-2.5 h-2.5 bg-gray-300 border border-black inline-block" /> High
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="w-2.5 h-2.5 bg-gray-400 border border-black inline-block" /> Medium
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="w-2.5 h-2.5 bg-gray-500 border border-black inline-block" /> Low
            </span>
            <span className="inline-flex items-center gap-1">
              <i className="w-2.5 h-2.5 bg-gray-200 border border-black inline-block" /> None
            </span>
            <span className="text-gray-400">// COLOR_ON_HOVER</span>
          </div>
          <label className="inline-flex items-center gap-2 border-2 border-black dark:border-white bg-white dark:bg-black px-2 py-1 font-mono text-[10px] font-bold uppercase">
            VIEW:
            <select
              className="bg-transparent font-mono text-[10px] font-bold uppercase outline-none cursor-pointer"
              value={view}
              onChange={(e) => setView(e.target.value as ViewMode)}
              aria-label="Timeline view"
            >
              <option value="yearly">YEARLY</option>
              <option value="monthly">MONTHLY</option>
            </select>
          </label>
        </div>
      </div>

      <div
        className="border-2 border-black dark:border-white bg-[#F7F5F0] dark:bg-[#F7F5F0] p-3 sm:p-4 overflow-x-auto"
        role="img"
        aria-label="Activity timeline as stacked cubes. Default monochrome; color appears on hover."
      >
        <div
          className="relative min-h-[110px] sm:min-h-[130px] flex items-end justify-center gap-3 sm:gap-6 pt-4"
          style={{ perspective: '900px' }}
        >
          {/* Floor grid */}
          <div
            className="absolute left-4 right-4 bottom-6 h-12 opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #bbb 1px, transparent 1px), linear-gradient(to bottom, #bbb 1px, transparent 1px)',
              backgroundSize: '18px 18px',
              transform: 'rotateX(68deg)',
              transformOrigin: 'bottom center',
            }}
          />

          {bars.map((bar) => {
            const level = activityLevelFromCount(bar.commits, max);
            const isLit = activeId === bar.id;
            const units =
              level === 'none' ? 1 : Math.max(2, Math.round((bar.commits / max) * 6));
            const faces = cubeFace(level, isLit);

            return (
              <button
                key={bar.id}
                type="button"
                className="relative z-10 flex flex-col items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                style={{ transformStyle: 'preserve-3d' }}
                aria-label={`${bar.dateLabel}: ${bar.commits} commits, ${levelLabel(level)}`}
                onMouseEnter={() => setHovered(bar.id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setFocused(bar.id)}
                onBlur={() => setFocused(null)}
              >
                <div className="flex flex-col-reverse items-center gap-[2px]">
                  {Array.from({ length: units }).map((_, i) => {
                    const size = 16;
                    return (
                      <span
                        key={i}
                        className="relative block transition-colors duration-300"
                        style={{
                          width: size,
                          height: size * 0.55,
                          transform: 'rotateX(50deg) rotateZ(-35deg)',
                          transformStyle: 'preserve-3d',
                        }}
                      >
                        <span
                          className="absolute inset-0 border border-black/30"
                          style={{ background: faces.top }}
                        />
                        <span
                          className="absolute top-full left-0 w-full border border-black/25"
                          style={{
                            height: size * 0.3,
                            background: faces.right,
                            transform: 'rotateX(-90deg)',
                            transformOrigin: 'top',
                          }}
                        />
                        <span
                          className="absolute top-0 right-full h-full border border-black/25"
                          style={{
                            width: size * 0.3,
                            background: faces.left,
                            transform: 'rotateY(-90deg)',
                            transformOrigin: 'right',
                          }}
                        />
                      </span>
                    );
                  })}
                </div>

                {isLit && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full min-w-[9rem] max-w-[14rem] w-max p-2 bg-black text-white border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,0.25)] pointer-events-none z-20">
                    <span className="block font-mono text-[10px] font-bold uppercase break-words leading-tight">
                      {bar.dateLabel}
                    </span>
                    <span className="block font-mono text-[10px] uppercase mt-1 break-words">
                      Commits: {bar.commits}
                    </span>
                    <span className="block font-mono text-[10px] uppercase break-words">
                      Level: {levelLabel(level)}
                    </span>
                  </span>
                )}

                <span className="font-mono text-[10px] font-bold text-black/60 uppercase">
                  {bar.label}
                </span>
              </button>
            );
          })}
        </div>

        {view === 'yearly' && (
          <div className="flex justify-between px-2 mt-0.5 font-mono text-[10px] font-bold text-black/40 uppercase">
            {years.map((y) => (
              <span key={y}>{y}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityTimeline;
