/**
 * Fetch public GitHub repo contributors for the Achievement section.
 * Uses unauthenticated API (60 req/hr) unless GITHUB_TOKEN is set.
 */

export interface GitHubContributor {
  login: string;
  avatarUrl: string;
  profileUrl: string;
  contributions: number;
}

const REPO_URL_RE =
  /^https?:\/\/(?:www\.)?github\.com\/([^/]+)\/([^/#?]+?)(?:\.git)?\/?$/i;

/** Parse `https://github.com/owner/repo` (with optional .git / trailing slash). */
export function parseGitHubRepoUrl(url: string | null | undefined): { owner: string; repo: string } | null {
  if (!url?.trim()) return null;
  const match = url.trim().match(REPO_URL_RE);
  if (!match) return null;
  const owner = match[1];
  const repo = match[2].replace(/\.git$/i, '');
  if (!owner || !repo || owner === '.' || repo === '.') return null;
  return { owner, repo };
}

type GhContributorJson = {
  login?: string;
  avatar_url?: string;
  html_url?: string;
  contributions?: number;
  type?: string;
};

/**
 * List contributors for a repo URL. Returns [] on failure / private / invalid URL.
 */
export async function fetchGitHubContributors(
  githubUrl: string | null | undefined,
  options?: { perPage?: number; signal?: AbortSignal }
): Promise<GitHubContributor[]> {
  const parsed = parseGitHubRepoUrl(githubUrl);
  if (!parsed) return [];

  const perPage = Math.min(Math.max(options?.perPage ?? 24, 1), 100);
  const endpoint = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/contributors?per_page=${perPage}`;

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'uiug-website',
    'X-GitHub-Api-Version': '2022-11-28',
  };

  const token = (import.meta.env.GITHUB_TOKEN as string | undefined)?.trim();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(endpoint, { headers, signal: options?.signal });
    if (!res.ok) return [];

    const data = (await res.json()) as GhContributorJson[];
    if (!Array.isArray(data)) return [];

    return data
      .filter((c) => c.type !== 'Bot' && Boolean(c.login) && Boolean(c.avatar_url))
      .map((c) => ({
        login: c.login as string,
        avatarUrl: c.avatar_url as string,
        profileUrl: c.html_url || `https://github.com/${c.login}`,
        contributions: c.contributions ?? 0,
      }));
  } catch {
    return [];
  }
}
