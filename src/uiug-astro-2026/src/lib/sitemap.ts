/**
 * Build sitemap entries from Umbraco content, respecting hideFromXmlSitemap
 * and using searchEngineChangeFrequency, searchEngineRelativePriority, updateDate.
 */
import { getContentItem, getPaths } from '../api/umbraco.js';

const SITEMAP_CHANGEFREQ = new Set(['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly']);

function normalizeChangefreq(value: string | null | undefined): string | undefined {
  if (!value || typeof value !== 'string') return undefined;
  const lower = value.trim().toLowerCase();
  return SITEMAP_CHANGEFREQ.has(lower) ? lower : undefined;
}

function normalizePriority(value: number | null | undefined): number | undefined {
  if (value == null || typeof value !== 'number') return undefined;
  if (Number.isNaN(value)) return undefined;
  const n = Math.min(1, Math.max(0, value));
  return Math.round(n * 100) / 100;
}

function formatLastmod(date: string | null | undefined): string | undefined {
  if (!date) return undefined;
  try {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return undefined;
    return d.toISOString().split('T')[0];
  } catch {
    return undefined;
  }
}

export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

type ContentWithSitemapProps = {
  route?: { path?: string | null } | null;
  id?: string;
  updateDate?: string | null;
  properties?: {
    hideFromXmlSitemap?: boolean | null;
    updateDate?: string | null;
    searchEngineChangeFrequency?: string | null;
    searchEngineRelativePriority?: number | null;
  };
};

async function entriesForSection(
  site: string,
  basePath: string,
  pathPrefix: string
): Promise<SitemapEntry[]> {
  const base = site.replace(/\/$/, '');
  const out: SitemapEntry[] = [];

  try {
    const paths = await getPaths(basePath);
    if (!paths?.length) return out;

    for (const pathItem of paths) {
      const path = pathItem.path;
      if (!path || path === '#') continue;

      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      let content: ContentWithSitemapProps | null = null;
      try {
        content = (await getContentItem(cleanPath)) as ContentWithSitemapProps | null;
      } catch {
        continue;
      }

      if (!content) continue;
      const props = content.properties ?? {};
      if (props.hideFromXmlSitemap === true) continue;

      const segment = path.replace(/^\/|\/$/g, '').split('/').filter(Boolean).pop() ?? content.id ?? '';
      const urlPath = segment ? `${pathPrefix}/${segment}` : pathPrefix;
      const url = `${base}/${urlPath.replace(/^\/+/, '')}`;

      out.push({
        url,
        lastmod: formatLastmod(props.updateDate ?? content.updateDate),
        changefreq: normalizeChangefreq(props.searchEngineChangeFrequency),
        priority: normalizePriority(props.searchEngineRelativePriority),
      });
    }
  } catch {
    // skip section
  }

  return out;
}

/**
 * Fetch list content (home, events, speakers, projects) to get optional sitemap settings.
 */
async function entryForListPage(
  site: string,
  path: string,
  contentPath: string
): Promise<SitemapEntry | null> {
  const base = site.replace(/\/$/, '');
  try {
    const content = (await getContentItem(contentPath)) as ContentWithSitemapProps | null;
    if (!content) return { url: `${base}${path.startsWith('/') ? path : '/' + path}` };
    const props = content.properties ?? {};
    if (props.hideFromXmlSitemap === true) return null;
    return {
      url: `${base}${path.startsWith('/') ? path : '/' + path}`,
      lastmod: formatLastmod(props.updateDate ?? content.updateDate),
      changefreq: normalizeChangefreq(props.searchEngineChangeFrequency),
      priority: normalizePriority(props.searchEngineRelativePriority),
    };
  } catch {
    return { url: `${base}${path.startsWith('/') ? path : '/' + path}` };
  }
}

export async function getSitemapEntries(site: string): Promise<SitemapEntry[]> {
  const entries: SitemapEntry[] = [];

  // Static / list pages (optionally from CMS)
  const homeEntry = await entryForListPage(site, '/', 'home');
  if (homeEntry) entries.push(homeEntry);

  const eventsListEntry = await entryForListPage(site, '/events', 'events');
  if (eventsListEntry) entries.push(eventsListEntry);

  const speakersListEntry = await entryForListPage(site, '/speakers', 'speakers');
  if (speakersListEntry) entries.push(speakersListEntry);

  const projectsListEntry = await entryForListPage(site, '/projects', 'projects');
  if (projectsListEntry) entries.push(projectsListEntry);

  // Dynamic detail pages
  const eventEntries = await entriesForSection(site, 'events', '/events');
  entries.push(...eventEntries);

  const speakerEntries = await entriesForSection(site, 'speakers', '/speakers');
  entries.push(...speakerEntries);

  const projectEntries = await entriesForSection(site, 'projects', '/projects');
  entries.push(...projectEntries);

  return entries;
}

export function sitemapEntriesToXml(entries: SitemapEntry[]): string {
  const urlNodes = entries
    .map((e) => {
      let loc = `<loc>${escapeXml(e.url)}</loc>`;
      let lastmod = e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : '';
      let changefreq = e.changefreq ? `\n    <changefreq>${e.changefreq}</changefreq>` : '';
      let priority = e.priority != null ? `\n    <priority>${e.priority}</priority>` : '';
      return `  <url>\n    ${loc}${lastmod}${changefreq}${priority}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
