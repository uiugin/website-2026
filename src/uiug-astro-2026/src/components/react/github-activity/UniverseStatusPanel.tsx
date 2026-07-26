import React from 'react';
import { Code2, Boxes, CalendarDays, Flame, Trophy, Star } from 'lucide-react';
import type { UniverseStatusItem } from './planetMetrics';

interface UniverseStatusPanelProps {
  items: UniverseStatusItem[];
}

const ICONS: Record<UniverseStatusItem['icon'], React.FC<{ className?: string }>> = {
  commits: Code2,
  repos: Boxes,
  years: CalendarDays,
  streak: Flame,
  trophy: Trophy,
  rank: Star,
};

const UniverseStatusPanel: React.FC<UniverseStatusPanelProps> = ({ items }) => {
  if (items.length === 0) return null;

  return (
    <aside
      className="absolute left-3 top-14 z-20 w-[min(100%,200px)] border-2 border-white/50 bg-transparent p-3 pointer-events-auto"
      aria-label="Universe status"
    >
      <div className="mb-3">
        <h5 className="font-display text-sm uppercase text-primary tracking-wide inline-block border-b border-white/50 pb-2">
          UNIVERSE_STATUS
        </h5>
      </div>
      <ul className="space-y-2.5">
        {items.map((item) => {
          const Icon = ICONS[item.icon];
          return (
            <li key={item.key} className="flex items-start gap-2">
              <Icon className="w-3.5 h-3.5 text-white shrink-0 mt-0.5" aria-hidden />
              <div className="min-w-0">
                <p className="font-mono text-[9px] font-bold uppercase text-white/70 leading-none mb-0.5">
                  {item.label}
                </p>
                <p className="font-mono text-xs font-bold uppercase text-accent-yellow truncate">
                  {item.value}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};

export default UniverseStatusPanel;
