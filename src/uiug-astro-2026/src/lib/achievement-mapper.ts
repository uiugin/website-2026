/**
 * Achievement section props mapper
 * Maps Umbraco `achievement` block properties to Achievement component props.
 */

import type { GitHubContributor } from './github-contributors.js';
import { fetchGitHubContributors } from './github-contributors.js';

export interface AchievementProps {
  title?: string;
  event?: string;
  year?: string;
  context?: string;
  placement?: string;
  category?: string;
  partners?: string;
  description?: string;
  linkUrl?: string;
  linkLabel?: string;
  linkTarget?: string | null;
  githubUrl?: string | null;
  contributors?: GitHubContributor[];
}

type ApiLink = {
  url?: string | null;
  title?: string | null;
  target?: string | null;
  linkType?: string | null;
  route?: { path?: string | null } | null;
};

type AchievementElementProperties = {
  title?: string | null;
  event?: string | null;
  year?: string | null;
  context?: string | null;
  placement?: string | null;
  category?: string | null;
  partners?: string | null;
  description?: string | null;
  link?: ApiLink[] | null;
  githubUrl?: string | null;
};

function linkHref(link: ApiLink | null | undefined): {
  url: string;
  label?: string;
  target?: string | null;
} {
  if (!link) return { url: '#' };

  let href = (link.url ?? link.route?.path ?? '#').trim();
  if (!href || href === '#') {
    return { url: '#', label: link.title?.trim() || undefined, target: link.target };
  }

  if (href === '/#/' || href === '#/') {
    return { url: '/', label: link.title?.trim() || undefined, target: link.target };
  }

  const isExternal =
    link.linkType?.toLowerCase() === 'external' ||
    /^https?:\/\//i.test(href) ||
    (!href.startsWith('/') && href.includes('.'));

  if (isExternal && !/^https?:\/\//i.test(href)) {
    href = `https://${href}`;
  } else if (!isExternal && !href.startsWith('/') && !/^https?:\/\//i.test(href)) {
    href = `/${href}`;
  }

  return { url: href, label: link.title?.trim() || undefined, target: link.target };
}

/**
 * Map Umbraco Achievement element (`contentType: achievement`) to component props.
 * Returns null when required content is missing.
 */
export function mapAchievementProps(
  achievementElement: {
    properties?: AchievementElementProperties | null;
  } | null | undefined
): AchievementProps | null {
  const props = achievementElement?.properties;
  if (!props) return null;

  const category = props.category?.trim();
  if (!category) return null;

  const { url: linkUrl, label: linkLabel, target: linkTarget } = linkHref(props.link?.[0]);
  const githubUrl = props.githubUrl?.trim() || null;

  return {
    title: props.title?.trim() || undefined,
    event: props.event?.trim() || undefined,
    year: props.year?.trim() || undefined,
    context: props.context?.trim() || undefined,
    placement: props.placement?.trim() || undefined,
    category,
    partners: props.partners?.trim() || undefined,
    description: props.description?.trim() || undefined,
    linkUrl: linkUrl !== '#' ? linkUrl : undefined,
    linkLabel,
    linkTarget: linkTarget ?? '_blank',
    githubUrl,
  };
}

/** Map props and attach GitHub contributors when `githubUrl` is set. */
export async function mapAchievementPropsWithContributors(
  achievementElement: {
    properties?: AchievementElementProperties | null;
  } | null | undefined
): Promise<AchievementProps | null> {
  const mapped = mapAchievementProps(achievementElement);
  if (!mapped) return null;

  const contributors = mapped.githubUrl
    ? await fetchGitHubContributors(mapped.githubUrl)
    : [];

  return { ...mapped, contributors };
}
