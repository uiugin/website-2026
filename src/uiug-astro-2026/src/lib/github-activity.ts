/**
 * Fetch public GitHub activity for a speaker profile URL.
 * Fail-soft: returns null on any error (missing URL, rate limit, network).
 * Build/SSR may use GITHUB_TOKEN. Client sync uses public API only (no token).
 */

export interface GithubRepo {
  name: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updatedAt: string | null;
  pushedAt: string | null;
}

export interface GithubEventItem {
  id: string;
  type: string;
  summary: string;
  repoName: string;
  repoUrl: string;
  createdAt: string;
  commitCount?: number;
}

export interface GithubUserStats {
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  yearsActive: number;
}

export interface GithubReleaseItem {
  repo: string;
  tag: string;
  url: string;
  publishedAt: string;
}

export interface GithubTimelineDay {
  date: string;
  commits: number;
}

export interface GithubActivity {
  username: string;
  profileUrl: string;
  /** GitHub avatar (API or fallback PNG). */
  avatarUrl: string;
  repos: GithubRepo[];
  events: GithubEventItem[];
  user: GithubUserStats | null;
  totalStars: number;
  totalForks: number;
  releases: GithubReleaseItem[];
  timeline: GithubTimelineDay[];
  commitsLast7Days: number | null;
  lastPushAt: string | null;
  lastCommitSummary: string | null;
  mostStarred: GithubRepo | null;
  activeRepoCount: number;
}

const REPO_LIMIT = 12;
const EVENT_FETCH = 100;
const EVENT_LIMIT = 40;
const RELEASE_REPO_LIMIT = 3;
const CACHE_TTL_MS = 60 * 60 * 1000;

const EVENT_ALLOWLIST = new Set([
  'PushEvent',
  'PullRequestEvent',
  'IssuesEvent',
  'CreateEvent',
  'ForkEvent',
  'ReleaseEvent',
  'PublicEvent',
]);

type CacheEntry = { expires: number; value: GithubActivity | null };
const activityCache = new Map<string, CacheEntry>();

/** Extract GitHub username from a profile URL or bare username. */
export function parseGithubUsername(githubUrl: string | null | undefined): string | null {
  if (!githubUrl || typeof githubUrl !== 'string') return null;
  const trimmed = githubUrl.trim();
  if (!trimmed) return null;

  if (!trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed.replace(/^@/, '') || null;
  }

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProtocol);
    if (!url.hostname.replace(/^www\./, '').endsWith('github.com')) return null;
    const segment = url.pathname.split('/').filter(Boolean)[0];
    if (!segment || segment === 'orgs' || segment === 'settings') return null;
    return segment;
  } catch {
    return null;
  }
}

function githubHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'uiug-website',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = (import.meta.env.GITHUB_TOKEN as string | undefined)?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function yearsActiveFrom(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return 0;
  const years = (Date.now() - created) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.max(0, Math.floor(years * 10) / 10);
}

function dayKey(iso: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function summarizeEvent(event: {
  type?: string;
  repo?: { name?: string };
  payload?: Record<string, unknown>;
}): string {
  const type = event.type ?? 'Event';
  const repo = event.repo?.name ?? 'repo';
  const payload = event.payload ?? {};

  switch (type) {
    case 'PushEvent': {
      const count = Array.isArray(payload.commits) ? payload.commits.length : 0;
      return count > 0 ? `Pushed ${count} commit${count === 1 ? '' : 's'} to ${repo}` : `Pushed to ${repo}`;
    }
    case 'PullRequestEvent': {
      const action = typeof payload.action === 'string' ? payload.action : 'updated';
      const pr = payload.pull_request as { number?: number } | undefined;
      const num = pr?.number != null ? `#${pr.number}` : '';
      return `PR ${action} ${num} on ${repo}`.trim();
    }
    case 'IssuesEvent': {
      const action = typeof payload.action === 'string' ? payload.action : 'updated';
      const issue = payload.issue as { number?: number } | undefined;
      const num = issue?.number != null ? `#${issue.number}` : '';
      return `Issue ${action} ${num} on ${repo}`.trim();
    }
    case 'ForkEvent':
      return `Forked ${repo}`;
    case 'CreateEvent': {
      const refType = typeof payload.ref_type === 'string' ? payload.ref_type : 'ref';
      return `Created ${refType} on ${repo}`;
    }
    case 'ReleaseEvent': {
      const action = typeof payload.action === 'string' ? payload.action : 'published';
      const release = payload.release as { tag_name?: string } | undefined;
      const tag = release?.tag_name ? ` ${release.tag_name}` : '';
      return `Release ${action}${tag} on ${repo}`.trim();
    }
    case 'PublicEvent':
      return `Made ${repo} public`;
    default:
      return `${type.replace(/Event$/, '')} on ${repo}`;
  }
}

function buildTimeline(events: GithubEventItem[]): GithubTimelineDay[] {
  const byDay = new Map<string, number>();
  for (const e of events) {
    if (e.type !== 'PushEvent') continue;
    const key = dayKey(e.createdAt);
    if (!key) continue;
    const n = e.commitCount && e.commitCount > 0 ? e.commitCount : 1;
    byDay.set(key, (byDay.get(key) ?? 0) + n);
  }
  return [...byDay.entries()]
    .map(([date, commits]) => ({ date, commits }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function commitsInLast7Days(timeline: GithubTimelineDay[]): number {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let total = 0;
  for (const day of timeline) {
    const t = new Date(day.date).getTime();
    if (!Number.isNaN(t) && t >= cutoff) total += day.commits;
  }
  return total;
}

async function fetchJson<T>(url: string, headers: HeadersInit): Promise<T | null> {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function loadGithubActivity(username: string): Promise<GithubActivity | null> {
  const profileUrl = `https://github.com/${username}`;
  const headers = githubHeaders();
  const encoded = encodeURIComponent(username);

  const [userRaw, reposRaw, eventsRaw] = await Promise.all([
    fetchJson<{
      public_repos?: number;
      followers?: number;
      following?: number;
      created_at?: string;
      avatar_url?: string;
    }>(`https://api.github.com/users/${encoded}`, headers),
    fetchJson<
      Array<{
        name?: string;
        html_url?: string;
        description?: string | null;
        language?: string | null;
        stargazers_count?: number;
        forks_count?: number;
        updated_at?: string;
        pushed_at?: string;
        fork?: boolean;
        archived?: boolean;
      }>
    >(
      `https://api.github.com/users/${encoded}/repos?sort=updated&per_page=${REPO_LIMIT}&type=owner`,
      headers
    ),
    fetchJson<
      Array<{
        id?: string;
        type?: string;
        created_at?: string;
        repo?: { name?: string; url?: string };
        payload?: Record<string, unknown>;
      }>
    >(`https://api.github.com/users/${encoded}/events/public?per_page=${EVENT_FETCH}`, headers),
  ]);

  if (!userRaw && !reposRaw && !eventsRaw) {
    return null;
  }

  const repos: GithubRepo[] = [];
  if (reposRaw) {
    for (const r of reposRaw) {
      if (!r.name || !r.html_url || r.fork) continue;
      repos.push({
        name: r.name,
        url: r.html_url,
        description: r.description ?? null,
        language: r.language ?? null,
        stars: r.stargazers_count ?? 0,
        forks: r.forks_count ?? 0,
        updatedAt: r.updated_at ?? null,
        pushedAt: r.pushed_at ?? null,
      });
    }
  }

  const events: GithubEventItem[] = [];
  if (eventsRaw) {
    for (const e of eventsRaw) {
      if (!e.id || !e.type || !EVENT_ALLOWLIST.has(e.type)) continue;
      const repoName = e.repo?.name ?? 'unknown';
      const repoUrl = repoName.includes('/') ? `https://github.com/${repoName}` : profileUrl;
      const payload = e.payload ?? {};
      const commitCount =
        e.type === 'PushEvent' && Array.isArray(payload.commits) ? payload.commits.length : undefined;
      events.push({
        id: e.id,
        type: e.type,
        summary: summarizeEvent(e),
        repoName,
        repoUrl,
        createdAt: e.created_at ?? '',
        ...(commitCount != null ? { commitCount } : {}),
      });
      if (events.length >= EVENT_LIMIT) break;
    }
  }

  if (repos.length === 0 && events.length === 0 && !userRaw) {
    return null;
  }

  const totalStars = repos.reduce((s, r) => s + r.stars, 0);
  const totalForks = repos.reduce((s, r) => s + r.forks, 0);
  const mostStarred =
    repos.length > 0 ? [...repos].sort((a, b) => b.stars - a.stars)[0] ?? null : null;

  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const activeRepoCount = repos.filter((r) => {
    const t = r.pushedAt ? new Date(r.pushedAt).getTime() : 0;
    return !Number.isNaN(t) && t >= ninetyDaysAgo;
  }).length;

  const timeline = buildTimeline(events);
  const hasPushData = timeline.length > 0;
  const commitsLast7Days = hasPushData ? commitsInLast7Days(timeline) : null;

  const pushEvents = events.filter((e) => e.type === 'PushEvent');
  const lastPush = pushEvents[0] ?? null;

  const user: GithubUserStats | null = userRaw?.created_at
    ? {
        publicRepos: userRaw.public_repos ?? repos.length,
        followers: userRaw.followers ?? 0,
        following: userRaw.following ?? 0,
        createdAt: userRaw.created_at,
        yearsActive: yearsActiveFrom(userRaw.created_at),
      }
    : null;

  const releaseCandidates = [...repos]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, RELEASE_REPO_LIMIT);

  const releaseResults = await Promise.all(
    releaseCandidates.map(async (repo) => {
      const fullName = `${username}/${repo.name}`;
      const data = await fetchJson<
        Array<{ tag_name?: string; html_url?: string; published_at?: string }>
      >(
        `https://api.github.com/repos/${encodeURIComponent(username)}/${encodeURIComponent(repo.name)}/releases?per_page=1`,
        headers
      );
      const first = data?.[0];
      if (!first?.tag_name || !first.html_url) return null;
      return {
        repo: fullName,
        tag: first.tag_name,
        url: first.html_url,
        publishedAt: first.published_at ?? '',
      } satisfies GithubReleaseItem;
    })
  );
  const releases = releaseResults.filter((r): r is GithubReleaseItem => r != null);

  return {
    username,
    profileUrl,
    avatarUrl: userRaw?.avatar_url?.trim() || `https://github.com/${username}.png`,
    repos,
    events,
    user,
    totalStars,
    totalForks,
    releases,
    timeline,
    commitsLast7Days,
    lastPushAt: lastPush?.createdAt ?? repos[0]?.pushedAt ?? null,
    lastCommitSummary: lastPush?.summary ?? null,
    mostStarred,
    activeRepoCount,
  };
}

/**
 * Load public GitHub signal for a profile URL.
 * Cached in-memory for CACHE_TTL_MS within the same process unless skipCache is set.
 * Safe to call from the browser (token is server-only via env; client uses public rate limits).
 */
export async function fetchGithubActivity(
  githubUrl: string | null | undefined,
  options?: { skipCache?: boolean }
): Promise<GithubActivity | null> {
  const username = parseGithubUsername(githubUrl);
  if (!username) return null;

  const cacheKey = username.toLowerCase();
  if (!options?.skipCache) {
    const cached = activityCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }
  }

  try {
    const value = await loadGithubActivity(username);
    activityCache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, value });
    return value;
  } catch {
    activityCache.set(cacheKey, { expires: Date.now() + CACHE_TTL_MS, value: null });
    return null;
  }
}

export type ActivityLevel = 'none' | 'low' | 'medium' | 'high';

export function activityLevelFromCount(commits: number, max: number): ActivityLevel {
  if (commits <= 0) return 'none';
  if (max <= 0) return 'low';
  const ratio = commits / max;
  if (ratio >= 0.66) return 'high';
  if (ratio >= 0.33) return 'medium';
  return 'low';
}
