/**
 * Header festival marquee mapper
 * Maps Site Settings `headerMarquee` + `headerMarqueeLink` to FestivalBanner props.
 */

export interface FestivalBannerProps {
  festivalName: string;
  linkUrl: string;
  linkTarget?: string | null;
  marqueeItems: string[];
}

type ApiLink = {
  url?: string | null;
  title?: string | null;
  target?: string | null;
  linkType?: string | null;
  route?: { path?: string | null } | null;
};

type SiteSettingsMarqueeProps = {
  headerMarquee?: Array<string | null> | null;
  headerMarqueeLink?: ApiLink[] | null;
};

function linkHref(link: ApiLink | null | undefined): { url: string; label?: string; target?: string | null } {
  if (!link) return { url: '#' };

  let href = (link.url ?? link.route?.path ?? '#').trim();
  if (!href || href === '#') return { url: '#', label: link.title?.trim() || undefined, target: link.target };

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
 * Map Site Settings header marquee fields to FestivalBanner props.
 * Returns null when headerMarquee is null or empty — banner must not render.
 */
export function mapFestivalBannerFromSiteSettings(
  props: SiteSettingsMarqueeProps | null | undefined
): FestivalBannerProps | null {
  if (!props) return null;

  const raw = props.headerMarquee;
  if (raw == null || !Array.isArray(raw) || raw.length === 0) return null;

  const marqueeItems = raw
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter(Boolean);

  if (marqueeItems.length === 0) return null;

  const { url: linkUrl, label, target } = linkHref(props.headerMarqueeLink?.[0]);

  return {
    festivalName: label || marqueeItems[0] || 'Festival',
    linkUrl: linkUrl !== '#' ? linkUrl : '#',
    linkTarget: target ?? '_blank',
    marqueeItems,
  };
}

/** @deprecated Prefer mapFestivalBannerFromSiteSettings */
export function mapFestivalBannerProps(
  festivalElement: {
    properties?: SiteSettingsMarqueeProps & {
      festivalName?: string | null;
      link?: ApiLink[] | null;
      marqueeItems?: { items?: Array<{ content?: { properties?: { text?: string | null } } }> } | null;
      marqueeText?: string | null;
    } | null;
  } | null | undefined
): FestivalBannerProps | null {
  return mapFestivalBannerFromSiteSettings(festivalElement?.properties ?? null);
}
