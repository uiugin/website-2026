import type { GithubActivity } from '../../../lib/github-activity';

export type PlanetId =
  | 'sun'
  | 'mercury'
  | 'venus'
  | 'earth'
  | 'moon'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | `asteroid-${number}`;

export interface MetricRow {
  label: string;
  value: string;
}

export interface CelestialBodyMeta {
  id: PlanetId;
  label: string;
  ariaLabel: string;
  metrics: MetricRow[];
  /** Accent color for the symbol next to the heading (shown on hover). */
  symbolColor: string;
  href?: string;
}

export interface UniverseStatusItem {
  key: string;
  label: string;
  value: string;
  icon: 'commits' | 'repos' | 'years' | 'streak' | 'trophy' | 'rank';
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return null;
  }
}

function pushMetrics(rows: MetricRow[], label: string, value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return;
  rows.push({ label, value: String(value) });
}

/** Consecutive active days ending at the most recent push day (public timeline only). */
function computeStreaks(timeline: { date: string; commits: number }[]): {
  current: number | null;
  longest: number | null;
} {
  const days = [...new Set(timeline.filter((d) => d.commits > 0).map((d) => d.date))].sort();
  if (days.length === 0) return { current: null, longest: null };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]).getTime();
    const cur = new Date(days[i]).getTime();
    const diff = Math.round((cur - prev) / (24 * 60 * 60 * 1000));
    if (diff === 1) {
      run += 1;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  const last = days[days.length - 1];
  const lastTime = new Date(last).getTime();
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yKey = yesterday.toISOString().slice(0, 10);

  let current: number | null = null;
  if (last === todayKey || last === yKey) {
    current = 1;
    for (let i = days.length - 2; i >= 0; i--) {
      const a = new Date(days[i]).getTime();
      const b = new Date(days[i + 1]).getTime();
      if (Math.round((b - a) / (24 * 60 * 60 * 1000)) === 1) current += 1;
      else break;
    }
  }

  // Ignore lastTime unused — kept for clarity of window
  void lastTime;

  return { current, longest };
}

function galaxyRank(activity: GithubActivity): string {
  const score =
    activity.totalStars * 2 +
    activity.totalForks +
    (activity.user?.followers ?? 0) +
    activity.repos.length * 3;
  if (score >= 200) return 'COMMANDER';
  if (score >= 80) return 'VOYAGER';
  if (score >= 25) return 'EXPLORER';
  return 'ROOKIE';
}

export function buildUniverseStatus(activity: GithubActivity): UniverseStatusItem[] {
  const items: UniverseStatusItem[] = [];
  const commits = activity.timeline.reduce((s, d) => s + d.commits, 0);
  if (commits > 0) {
    items.push({
      key: 'commits',
      label: 'Total Commits',
      value: commits.toLocaleString(),
      icon: 'commits',
    });
  }

  const repos = activity.user?.publicRepos ?? activity.repos.length;
  if (repos > 0) {
    items.push({
      key: 'repos',
      label: 'Repositories',
      value: String(repos),
      icon: 'repos',
    });
  }

  if (activity.user?.yearsActive != null) {
    items.push({
      key: 'years',
      label: 'Years Active',
      value: String(activity.user.yearsActive),
      icon: 'years',
    });
  }

  const { current, longest } = computeStreaks(activity.timeline);
  if (current != null) {
    items.push({
      key: 'streak',
      label: 'Current Streak',
      value: `${current} day${current === 1 ? '' : 's'}`,
      icon: 'streak',
    });
  }
  if (longest != null) {
    items.push({
      key: 'longest',
      label: 'Longest Streak',
      value: `${longest} day${longest === 1 ? '' : 's'}`,
      icon: 'trophy',
    });
  }

  items.push({
    key: 'rank',
    label: 'Galaxy Rank',
    value: galaxyRank(activity),
    icon: 'rank',
  });

  return items;
}

export function buildCelestialBodies(activity: GithubActivity): CelestialBodyMeta[] {
  const sun: MetricRow[] = [];
  const commitTotal = activity.timeline.reduce((s, d) => s + d.commits, 0);
  if (commitTotal > 0) pushMetrics(sun, 'Core Energy', `${commitTotal.toLocaleString()} Commits`);
  pushMetrics(sun, 'Years Active', activity.user ? `${activity.user.yearsActive}` : null);
  if (activity.commitsLast7Days != null) {
    pushMetrics(sun, 'Recent Pulse', `${activity.commitsLast7Days} commits / 7d`);
  }

  const moon: MetricRow[] = [];
  if (activity.commitsLast7Days != null) {
    pushMetrics(moon, 'Commits (7d)', activity.commitsLast7Days);
  }
  pushMetrics(moon, 'Last Commit', activity.lastCommitSummary);
  const streaks = computeStreaks(activity.timeline);
  pushMetrics(moon, 'Streak', streaks.current != null ? `${streaks.current} days` : null);

  const mercury: MetricRow[] = [];
  const experimentRepos = activity.repos.filter(
    (r) => !r.stars || r.stars < 3 || (r.language && r.language !== activity.mostStarred?.language)
  ).length;
  pushMetrics(mercury, 'Experiments', Math.max(experimentRepos, Math.min(activity.repos.length, 8)));
  pushMetrics(mercury, 'Repositories', activity.repos.length);

  const venus: MetricRow[] = [];
  if (activity.user) {
    pushMetrics(venus, 'Followers', activity.user.followers);
    pushMetrics(venus, 'Following', activity.user.following);
  }

  const mars: MetricRow[] = [];
  if (activity.mostStarred) {
    pushMetrics(mars, 'Featured Repo', activity.mostStarred.name);
    pushMetrics(mars, 'Biggest Stars', activity.mostStarred.stars);
  }
  pushMetrics(mars, 'Featured Count', Math.min(4, activity.repos.filter((r) => r.stars > 0).length || activity.repos.length));

  const jupiter: MetricRow[] = [];
  pushMetrics(jupiter, 'Stars Earned', activity.totalStars);
  pushMetrics(jupiter, 'Forks', activity.totalForks);
  if (activity.user) {
    pushMetrics(jupiter, 'Followers', activity.user.followers);
  }

  const saturn: MetricRow[] = [];
  if (activity.releases.length > 0) {
    pushMetrics(saturn, 'Releases', activity.releases.length);
    pushMetrics(saturn, 'Latest', activity.releases.map((r) => r.tag).join(', '));
  }

  const earth: MetricRow[] = [];
  pushMetrics(earth, 'Active Repositories', activity.activeRepoCount);
  pushMetrics(earth, 'Active Releases', activity.releases.length);
  pushMetrics(earth, 'Last Push', formatDate(activity.lastPushAt));

  const bodies: CelestialBodyMeta[] = [
    {
      id: 'sun',
      label: 'SUN_CORE',
      ariaLabel: 'Sun core: total contribution power and account signal',
      metrics: sun,
      symbolColor: '#f5a623',
      href: activity.profileUrl,
    },
    {
      id: 'mercury',
      label: 'MERCURY_LEARNING',
      ariaLabel: 'Mercury: experiments and learning repositories',
      metrics: mercury,
      symbolColor: '#a8a29e',
      href: activity.profileUrl + '?tab=repositories',
    },
    {
      id: 'venus',
      label: 'VENUS_COMMUNITY',
      ariaLabel: 'Venus: community followers and following',
      metrics: venus,
      symbolColor: '#eab308',
      href: activity.profileUrl + '?tab=followers',
    },
    {
      id: 'earth',
      label: 'EARTH_CURRENT',
      ariaLabel: 'Earth: current development phase and active repositories',
      metrics: earth,
      symbolColor: '#3b82f6',
      href: activity.profileUrl + '?tab=repositories',
    },
    {
      id: 'moon',
      label: 'MOON_RECENT',
      ariaLabel: 'Moon: recent commit activity',
      metrics: moon,
      symbolColor: '#84cc16',
    },
    {
      id: 'mars',
      label: 'MARS_PROJECTS',
      ariaLabel: 'Mars: featured projects and releases',
      metrics: mars,
      symbolColor: '#e85d04',
      href: activity.mostStarred?.url,
    },
    {
      id: 'jupiter',
      label: 'JUPITER_IMPACT',
      ariaLabel: 'Jupiter: open-source impact stars forks followers',
      metrics: jupiter,
      symbolColor: '#d2a679',
      href: activity.profileUrl,
    },
    {
      id: 'saturn',
      label: 'SATURN_PACKAGES',
      ariaLabel: 'Saturn: packages and releases',
      metrics: saturn,
      symbolColor: '#e6d5a8',
      href: activity.releases[0]?.url,
    },
  ];

  activity.repos.slice(0, 8).forEach((repo, index) => {
    const metrics: MetricRow[] = [];
    pushMetrics(metrics, 'Repository Name', repo.name);
    pushMetrics(metrics, 'Language', repo.language);
    pushMetrics(metrics, 'Stars', repo.stars);
    pushMetrics(metrics, 'Last Updated', formatDate(repo.updatedAt ?? repo.pushedAt));
    bodies.push({
      id: `asteroid-${index}`,
      label: repo.name.toUpperCase().replace(/[^A-Z0-9_]/g, '_').slice(0, 18),
      ariaLabel: `Repository ${repo.name}`,
      metrics,
      symbolColor: '#9ca3af',
      href: repo.url,
    });
  });

  const coreIds = new Set(['sun', 'mercury', 'venus', 'earth', 'moon', 'mars', 'jupiter', 'saturn']);
  return bodies.filter((b) => b.metrics.length > 0 || coreIds.has(String(b.id)));
}
