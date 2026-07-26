/**
 * Festivals section props mapper
 * Maps Umbraco `festivals` / `festivalItem` block properties to Festivals component props.
 *
 * Note: title alias is `festivalname` (`name` conflicts with Umbraco).
 */

import { getMediaUrl } from '../api/umbraco.js';

export interface FestivalImage {
  url: string;
  alt?: string;
}

export interface FestivalItem {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: 'INCOMING' | 'LIVE' | 'ARCHIVED';
  date: string;
  location: string;
  linkUrl: string;
  linkLabel?: string;
  /** Festival posters shown as an in-panel slider */
  images?: FestivalImage[];
}

export interface FestivalsProps {
  title?: string;
  subtitle?: string;
  festivals?: FestivalItem[];
}

type ApiLink = {
  url?: string | null;
  title?: string | null;
  target?: string | null;
  linkType?: string | null;
  route?: { path?: string | null } | null;
};

type FestivalItemProperties = {
  festivalname?: string | null;
  tagline?: string | null;
  description?: string | null;
  status?: string | null;
  date?: string | null;
  location?: string | null;
  link?: ApiLink[] | null;
  images?: Array<{
    url?: string | null;
    name?: string | null;
    id?: string;
    mediaType?: string;
    crops?: unknown;
  }> | null;
};

type FestivalsElementProperties = {
  title?: string | null;
  subtitle?: string | null;
  festivalItems?: {
    items?: Array<{
      content?: {
        id?: string;
        contentType?: string;
        properties?: FestivalItemProperties | null;
      } | null;
    } | null> | null;
  } | null;
};

function normalizeStatus(value: string | null | undefined): FestivalItem['status'] {
  const upper = (value ?? '').trim().toUpperCase();
  if (upper === 'LIVE' || upper === 'ARCHIVED') return upper;
  return 'INCOMING';
}

/** Normalize Umbraco link picker values (External often omits https://). */
function linkHref(link: ApiLink | null | undefined): { url: string; label?: string } {
  if (!link) return { url: '#' };

  let href = (link.url ?? link.route?.path ?? '#').trim();
  if (!href || href === '#') return { url: '#', label: link.title?.trim() || undefined };

  if (href === '/#/' || href === '#/') {
    return { url: '/', label: link.title?.trim() || undefined };
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

  return { url: href, label: link.title?.trim() || undefined };
}

function mapFestivalItem(
  content: {
    id?: string;
    contentType?: string;
    properties?: FestivalItemProperties | null;
  } | null | undefined,
  index: number
): FestivalItem | null {
  if (!content?.properties) return null;
  if (content.contentType && content.contentType !== 'festivalItem') return null;

  const props = content.properties;
  const name = props.festivalname?.trim();
  if (!name) return null;

  const { url: linkUrl, label: linkTitle } = linkHref(props.link?.[0]);
  const images: FestivalImage[] = [];
  if (Array.isArray(props.images)) {
    for (const media of props.images) {
      const url = media ? getMediaUrl(media as Parameters<typeof getMediaUrl>[0]) : '';
      if (!url) continue;
      images.push({
        url,
        alt: media.name?.trim() || undefined,
      });
    }
  }

  return {
    id: content.id || `festival-${index}`,
    name,
    tagline: props.tagline?.trim() || '',
    description: props.description?.trim() || '',
    status: normalizeStatus(props.status),
    date: props.date?.trim() || '',
    location: props.location?.trim() || '',
    linkUrl,
    linkLabel: linkTitle,
    images,
  };
}

/**
 * Map Umbraco Festivals element (`contentType: festivals`) to component props.
 */
export function mapFestivalsProps(
  festivalsElement: {
    properties?: FestivalsElementProperties | null;
  } | null | undefined
): FestivalsProps {
  const props = festivalsElement?.properties;
  if (!props) return {};

  const mapped =
    props.festivalItems?.items
      ?.map((item, index) => mapFestivalItem(item?.content, index))
      .filter((item): item is FestivalItem => Boolean(item)) ?? [];

  return {
    title: props.title?.trim() || undefined,
    subtitle: props.subtitle?.trim() || undefined,
    festivals: mapped,
  };
}
